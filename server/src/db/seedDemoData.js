import crypto from 'crypto';
import { query } from '../db.js';

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;

const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'shipped', 'delivered'];

// Mix of statuses so Orders, Kitchen (accepted/preparing/ready) and Dashboard all have data
const ORDER_PLAN = [
  { status: 'pending', minutesAgo: 6, items: [{ id: 1, qty: 2 }, { id: 7, qty: 1 }], paymentMethod: 'cod' },
  { status: 'pending', minutesAgo: 14, items: [{ id: 12, qty: 1 }], paymentMethod: 'upi', orderType: 'takeaway' },
  { status: 'accepted', minutesAgo: 25, items: [{ id: 3, qty: 1 }, { id: 18, qty: 2 }], paymentMethod: 'cod' },
  { status: 'accepted', minutesAgo: 32, items: [{ id: 22, qty: 1 }, { id: 5, qty: 1 }], paymentMethod: 'upi' },
  { status: 'preparing', minutesAgo: 41, items: [{ id: 9, qty: 3 }], paymentMethod: 'cod' },
  { status: 'preparing', minutesAgo: 55, items: [{ id: 15, qty: 1 }, { id: 27, qty: 1 }], paymentMethod: 'cod', orderType: 'takeaway' },
  { status: 'ready', minutesAgo: 70, items: [{ id: 30, qty: 2 }, { id: 2, qty: 1 }], paymentMethod: 'upi' },
  { status: 'shipped', minutesAgo: 95, items: [{ id: 35, qty: 1 }, { id: 40, qty: 1 }], paymentMethod: 'cod' },
  { status: 'delivered', minutesAgo: 60 * 5, items: [{ id: 11, qty: 2 }], paymentMethod: 'cod' },
  { status: 'delivered', minutesAgo: 60 * 26, items: [{ id: 44, qty: 1 }, { id: 8, qty: 2 }], paymentMethod: 'upi' },
  { status: 'delivered', minutesAgo: 60 * 50, items: [{ id: 20, qty: 1 }, { id: 25, qty: 1 }, { id: 6, qty: 1 }], paymentMethod: 'cod' },
  { status: 'cancelled', minutesAgo: 60 * 30, items: [{ id: 16, qty: 1 }], paymentMethod: 'cod' },
];

const PROMOS = [
  { code: 'WELCOME10', discountType: 'percent', discountValue: 10, minOrder: 199, maxUses: 0, active: true },
  { code: 'FLAT50', discountType: 'fixed', discountValue: 50, minOrder: 299, maxUses: 100, active: true },
  { code: 'FREESHIP', discountType: 'free_delivery', discountValue: 0, minOrder: 0, maxUses: 0, active: true },
  { code: 'EXPIRED20', discountType: 'percent', discountValue: 20, minOrder: 0, maxUses: 0, active: false },
];

const CONTACT_MESSAGES = [
  {
    name: 'Rohit Sharma',
    email: 'rohit.sharma@example.com',
    phone: '+91 9811001100',
    subject: 'Bulk order for office party',
    message: 'Hi, we need catering for 40 people next Friday. Do you offer bulk discounts and on-time delivery to Gurgaon?',
    minutesAgo: 30,
    read: false,
  },
  {
    name: 'Priya Verma',
    email: 'priya.v@example.com',
    phone: '+91 9822002200',
    subject: 'Allergy information',
    message: 'Does your Paneer Tikka contain nuts? I have a severe peanut allergy and want to confirm before ordering.',
    minutesAgo: 60 * 3,
    read: false,
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    phone: '',
    subject: 'Late delivery feedback',
    message: 'My order yesterday arrived 30 minutes late and the food was cold. Please look into your delivery process.',
    minutesAgo: 60 * 20,
    read: false,
  },
  {
    name: 'Sneha Kapoor',
    email: 'sneha.k@example.com',
    phone: '+91 9844004400',
    subject: 'Franchise enquiry',
    message: 'I am interested in opening a FoodExpress franchise in Jaipur. Could you share the franchise terms?',
    minutesAgo: 60 * 30,
    read: true,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 9855005500',
    subject: 'Great service!',
    message: 'Just wanted to say the new menu is fantastic. The Biryani was the best I have had in Delhi. Keep it up!',
    minutesAgo: 60 * 48,
    read: true,
  },
];

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function buildStatusHistory(finalStatus, placedAt) {
  if (finalStatus === 'cancelled' || finalStatus === 'rejected') {
    return [
      { status: 'pending', at: placedAt.toISOString(), note: 'Order placed' },
      { status: finalStatus, at: new Date(placedAt.getTime() + 5 * 60 * 1000).toISOString(), note: 'Customer cancelled' },
    ];
  }
  const steps = STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(finalStatus) + 1);
  return steps.map((status, index) => ({
    status,
    at: new Date(placedAt.getTime() + index * 8 * 60 * 1000).toISOString(),
    note: status === 'pending' ? 'Order placed' : undefined,
  }));
}

function buildOrder(plan, customer, menuMap) {
  const now = Date.now();
  const placedAt = new Date(now - plan.minutesAgo * 60 * 1000);
  const orderType = plan.orderType || 'delivery';

  let subtotal = 0;
  const items = plan.items
    .filter(({ id }) => menuMap.has(id))
    .map(({ id, qty }) => {
      const menuItem = menuMap.get(id);
      const lineTotal = roundMoney(Number(menuItem.price) * qty);
      subtotal = roundMoney(subtotal + lineTotal);
      return {
        id,
        food_name: menuItem.food_name,
        food_category: menuItem.food_category,
        food_type: menuItem.food_type,
        food_image: menuItem.food_image,
        price: Number(menuItem.price),
        quantity: qty,
        lineTotal,
      };
    });

  const deliveryFee = orderType === 'takeaway' || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = roundMoney(subtotal + deliveryFee);
  const delivered = plan.status === 'delivered';

  return {
    createdAt: placedAt,
    payload: {
      id: crypto.randomUUID(),
      userId: customer.id,
      userEmail: customer.email,
      guestName: null,
      guestEmail: null,
      items,
      subtotal,
      deliveryFee,
      discount: 0,
      promoCode: null,
      total,
      orderType,
      address:
        orderType === 'takeaway'
          ? '123 Food Street, Connaught Place, New Delhi - 110001'
          : '42 Green Park, New Delhi - 110016',
      pincode: orderType === 'takeaway' ? null : '110016',
      phone: '+91 9876543210',
      paymentMethod: plan.paymentMethod,
      paymentStatus: delivered ? 'paid' : plan.paymentMethod === 'upi' ? 'pending_verification' : 'pending',
      razorpayPaymentId: null,
      razorpayOrderId: null,
      notes: '',
      scheduledFor: null,
      driverId: null,
      driverName: plan.status === 'shipped' || delivered ? 'Ravi Kumar' : null,
      status: plan.status,
      statusHistory: buildStatusHistory(plan.status, placedAt),
      createdAt: placedAt.toISOString(),
      updatedAt: placedAt.toISOString(),
      demoSeed: true,
    },
  };
}

export async function seedDemoContent() {
  const { rows: customerRows } = await query(
    `SELECT id, email FROM users WHERE email = 'customer@foodexpress.com'`
  );
  const customer = customerRows[0];
  if (!customer) {
    console.log('Demo customer not found — skipping demo orders/promos/inbox seed.');
    return;
  }

  const { rows: menuRows } = await query('SELECT id, payload FROM menu_items');
  const menuMap = new Map(menuRows.map((row) => [row.id, row.payload]));

  // Remove previously seeded demo content so re-running stays idempotent
  await query(`DELETE FROM orders WHERE payload->>'demoSeed' = 'true'`);
  await query(`DELETE FROM contact_messages WHERE payload->>'demoSeed' = 'true'`);
  await query(`DELETE FROM promo_codes WHERE payload->>'demoSeed' = 'true'`);

  let orderCount = 0;
  for (const plan of ORDER_PLAN) {
    const order = buildOrder(plan, customer, menuMap);
    if (order.payload.items.length === 0) continue;
    await query(
      `INSERT INTO orders (id, user_id, payload, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)`,
      [order.payload.id, customer.id, JSON.stringify(order.payload), order.createdAt]
    );
    orderCount += 1;
  }

  for (const promo of PROMOS) {
    const { active, code, ...rest } = promo;
    const payload = {
      ...rest,
      code,
      expiresAt: code === 'EXPIRED20' ? new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() : null,
      usedCount: code === 'WELCOME10' ? 23 : code === 'FLAT50' ? 8 : 0,
      demoSeed: true,
    };
    await query(
      `INSERT INTO promo_codes (id, code, payload, active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO NOTHING`,
      [crypto.randomUUID(), code, JSON.stringify(payload), active]
    );
  }

  for (const msg of CONTACT_MESSAGES) {
    const { minutesAgo, read, ...fields } = msg;
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);
    await query(
      `INSERT INTO contact_messages (id, payload, read, created_at)
       VALUES ($1, $2, $3, $4)`,
      [
        crypto.randomUUID(),
        JSON.stringify({ ...fields, createdAt: createdAt.toISOString(), demoSeed: true }),
        read,
        createdAt,
      ]
    );
  }

  console.log(
    `Seeded demo content: ${orderCount} orders (kitchen/pending/delivered mix), ${PROMOS.length} promo codes, ${CONTACT_MESSAGES.length} inbox messages.`
  );
}
