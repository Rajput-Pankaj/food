import { validatePromoCode } from './promos.js';

const TOLERANCE = 0.01;

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function getDeliveryFee(subtotal, settings, orderType, pincode) {
  if (orderType === 'takeaway') return 0;
  if (!settings.deliveryEnabled) return 0;

  const zones = Array.isArray(settings.deliveryZones) ? settings.deliveryZones : [];
  if (pincode && zones.length) {
    const zone = zones.find((z) =>
      Array.isArray(z.pincodes) && z.pincodes.some((p) => String(p).trim() === String(pincode).trim())
    );
    if (!zone) {
      return { error: 'Delivery not available to this pincode.' };
    }
    const threshold = Number(zone.freeDeliveryThreshold) || 0;
    const fee = Number(zone.deliveryFee) || 0;
    return subtotal >= threshold ? 0 : fee;
  }

  const threshold = Number(settings.freeDeliveryThreshold) || 0;
  const fee = Number(settings.deliveryFee) || 0;
  return subtotal >= threshold ? 0 : fee;
}

export async function validateAndBuildOrder(clientOrder, user, query) {
  if (!clientOrder?.id || !Array.isArray(clientOrder.items) || clientOrder.items.length === 0) {
    return { ok: false, error: 'Invalid order payload.' };
  }

  const orderType = clientOrder.orderType === 'takeaway' ? 'takeaway' : 'delivery';
  const menuIds = [...new Set(clientOrder.items.map((item) => Number(item.id)).filter(Boolean))];

  const [menuResult, settingsResult] = await Promise.all([
    query('SELECT id, payload FROM menu_items WHERE id = ANY($1::int[])', [menuIds]),
    query('SELECT payload FROM store_settings WHERE id = 1'),
  ]);

  const menuMap = new Map(menuResult.rows.map((row) => [row.id, row.payload]));
  const settings = settingsResult.rows[0]?.payload || {};

  if (orderType === 'delivery' && !settings.deliveryEnabled) {
    return { ok: false, error: 'Delivery is not available.' };
  }
  if (orderType === 'takeaway' && !settings.takeawayEnabled) {
    return { ok: false, error: 'Takeaway is not available.' };
  }

  const validatedItems = [];
  let subtotal = 0;

  for (const cartItem of clientOrder.items) {
    const id = Number(cartItem.id);
    const menuItem = menuMap.get(id);
    if (!menuItem || menuItem.available === false) {
      return { ok: false, error: `Menu item ${id} is unavailable.` };
    }

    const stock = menuItem.stock;
    const quantity = Math.max(1, Math.min(99, Number(cartItem.quantity) || 1));
    if (stock !== undefined && stock !== null && quantity > Number(stock)) {
      return { ok: false, error: `${menuItem.food_name} has insufficient stock.` };
    }

    const unitPrice = Number(menuItem.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return { ok: false, error: `Invalid price for menu item ${id}.` };
    }

    const lineTotal = roundMoney(unitPrice * quantity);
    subtotal = roundMoney(subtotal + lineTotal);
    validatedItems.push({
      id,
      food_name: menuItem.food_name,
      food_category: menuItem.food_category,
      food_type: menuItem.food_type,
      food_image: menuItem.food_image,
      price: unitPrice,
      quantity,
      lineTotal,
    });
  }

  const pincode = String(clientOrder.pincode || '').trim();
  const deliveryFeeResult = getDeliveryFee(subtotal, settings, orderType, pincode);
  if (deliveryFeeResult?.error) {
    return { ok: false, error: deliveryFeeResult.error };
  }
  let deliveryFee = typeof deliveryFeeResult === 'number' ? deliveryFeeResult : 0;

  let promoDiscount = 0;
  let promoMeta = null;
  let promoId = null;
  if (clientOrder.promoCode) {
    const promoResult = await validatePromoCode(clientOrder.promoCode, subtotal);
    if (!promoResult.ok) return { ok: false, error: promoResult.error };
    promoDiscount = promoResult.discount;
    promoId = promoResult.promoId;
    promoMeta = { code: promoResult.promo.code, discount: promoDiscount };
    if (promoResult.promo.discountType === 'free_delivery') {
      deliveryFee = 0;
    }
  }

  const total = roundMoney(Math.max(0, subtotal + deliveryFee - promoDiscount));

  const clientSubtotal = roundMoney(clientOrder.subtotal);
  const clientDeliveryFee = roundMoney(clientOrder.deliveryFee);
  const clientDiscount = roundMoney(clientOrder.discount || 0);
  const clientTotal = roundMoney(clientOrder.total);

  if (
    Math.abs(clientSubtotal - subtotal) > TOLERANCE ||
    Math.abs(clientDeliveryFee - deliveryFee) > TOLERANCE ||
    Math.abs(clientDiscount - promoDiscount) > TOLERANCE ||
    Math.abs(clientTotal - total) > TOLERANCE
  ) {
    return { ok: false, error: 'Order totals do not match menu prices.' };
  }

  const enabledMethods = Array.isArray(settings.enabledPaymentMethods)
    ? settings.enabledPaymentMethods
    : ['cod'];
  const paymentMethod = clientOrder.paymentMethod || 'cod';
  if (!enabledMethods.includes(paymentMethod)) {
    return { ok: false, error: 'Selected payment method is not available.' };
  }

  if (orderType === 'delivery' && !String(clientOrder.address || '').trim()) {
    return { ok: false, error: 'Delivery address is required.' };
  }
  if (!String(clientOrder.phone || '').trim()) {
    return { ok: false, error: 'Phone number is required.' };
  }

  const scheduledFor = clientOrder.scheduledFor || null;
  if (scheduledFor && new Date(scheduledFor) < new Date()) {
    return { ok: false, error: 'Scheduled time must be in the future.' };
  }

  let paymentStatus = 'pending';
  if (paymentMethod === 'upi') {
    paymentStatus = 'pending_verification';
  } else if (paymentMethod === 'cod') {
    paymentStatus = 'pending';
  }

  const statusHistory = [
    {
      status: 'pending',
      at: new Date().toISOString(),
      note: scheduledFor ? `Scheduled order for ${scheduledFor}` : 'Order placed',
    },
  ];

  const sessionUser = user || {};
  const payload = {
    id: clientOrder.id,
    userId: sessionUser.id || null,
    userEmail: sessionUser.email || clientOrder.guestEmail || null,
    guestName: clientOrder.guestName || null,
    guestEmail: clientOrder.guestEmail || null,
    items: validatedItems,
    subtotal,
    deliveryFee,
    discount: promoDiscount,
    promoCode: promoMeta?.code || null,
    total,
    orderType,
    address:
      orderType === 'takeaway'
        ? settings.storeAddress || ''
        : String(clientOrder.address).trim(),
    pincode: pincode || null,
    phone: String(clientOrder.phone).trim(),
    paymentMethod,
    paymentStatus,
    razorpayPaymentId: null,
    razorpayOrderId: null,
    notes: String(clientOrder.notes || '').trim(),
    scheduledFor,
    driverId: null,
    driverName: null,
    status: 'pending',
    statusHistory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { ok: true, payload, promoId };
}
