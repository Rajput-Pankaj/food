import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { adminRequired, authRequired, optionalAuth } from '../middleware/auth.js';
import { validateAndBuildOrder } from '../lib/validateOrder.js';
import { verifyRazorpayPayment, isRazorpayPaymentUsed } from '../lib/razorpay.js';
import { parseBody, orderStatusSchema, orderTrackSchema, orderGuestFieldsSchema, assignDriverSchema } from '../lib/validation.js';
import { escapeHtml } from '../lib/htmlEscape.js';
import { publicOrderView, phonesMatch } from '../lib/orderPublic.js';
import { invalidateStatsCache } from '../lib/statsCache.js';
import { incrementPromoUse } from '../lib/promos.js';
import { logAudit, getClientIp } from '../lib/audit.js';
import { notifyOrderPlaced, notifyOrderStatus } from '../lib/email.js';
import { broadcastOrderEvent } from './events.js';

const router = Router();

const orderCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders. Please try again later.' },
});

const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many tracking attempts.' },
});

function mapOrder(row) {
  return { ...row.payload, id: row.id, userId: row.user_id, createdAt: row.created_at, updatedAt: row.updated_at };
}

router.get('/', authRequired, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const status = req.query.status?.trim();
  const search = req.query.search?.trim();
  const isAdmin = req.user.role === 'admin';

  let sql = isAdmin
    ? 'SELECT * FROM orders WHERE 1=1'
    : 'SELECT * FROM orders WHERE user_id = $1';
  const params = isAdmin ? [] : [req.user.id];
  let paramIndex = params.length + 1;

  if (status) {
    sql += ` AND payload->>'status' = $${paramIndex++}`;
    params.push(status);
  }
  if (search && isAdmin) {
    sql += ` AND (payload->>'phone' ILIKE $${paramIndex} OR payload->>'userEmail' ILIKE $${paramIndex} OR id::text ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return res.json(result.rows.map(mapOrder));
});

router.get('/:id/invoice', authRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });
  if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const order = mapOrder(rows[0]);
  const { rows: settingsRows } = await query('SELECT payload FROM store_settings WHERE id = 1');
  const store = settingsRows[0]?.payload || {};

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(String(order.id).slice(0, 8).toUpperCase())}</title>
<style>body{font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem}
table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #eee;text-align:left}
h1{color:#16a34a}</style></head><body>
<h1>${escapeHtml(store.storeName || 'FoodExpress')}</h1>
<p>Invoice #${escapeHtml(String(order.id).slice(0, 8).toUpperCase())}</p>
<p>Date: ${escapeHtml(new Date(order.createdAt).toLocaleString('en-IN'))}</p>
<p>Customer: ${escapeHtml(order.guestName || order.userEmail || '—')}<br>Phone: ${escapeHtml(order.phone)}</p>
<table><tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
${(order.items || []).map((i) => `<tr><td>${escapeHtml(i.food_name)}</td><td>${escapeHtml(i.quantity)}</td><td>₹${escapeHtml(i.lineTotal)}</td></tr>`).join('')}
</table>
<p>Subtotal: ₹${escapeHtml(order.subtotal)}</p>
<p>Delivery: ₹${escapeHtml(order.deliveryFee)}</p>
${order.discount ? `<p>Discount: -₹${escapeHtml(order.discount)}</p>` : ''}
<p><strong>Total: ₹${escapeHtml(order.total)}</strong></p>
<p>Payment: ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</p>
</body></html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

router.post('/track', trackLimiter, async (req, res) => {
  const parsed = parseBody(orderTrackSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { orderId, phone, email } = parsed.data;
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const order = mapOrder(rows[0]);
  const matchPhone = phone && phonesMatch(phone, order.phone);
  const orderEmail = (order.guestEmail || order.userEmail || '').toLowerCase();
  const matchEmail = email && orderEmail === email.toLowerCase();

  if (!matchPhone && !matchEmail) {
    return res.status(403).json({ error: 'Phone or email does not match this order.' });
  }

  return res.json(publicOrderView(order));
});

router.get('/:id', authRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });
  if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  return res.json(mapOrder(rows[0]));
});

router.post('/', orderCreateLimiter, optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      const { rows: settingsRows } = await query('SELECT payload FROM store_settings WHERE id = 1');
      const settings = settingsRows[0]?.payload || {};
      if (!settings.guestCheckoutEnabled) {
        return res.status(401).json({ error: 'Please sign in to place an order.' });
      }
      const guestParsed = parseBody(orderGuestFieldsSchema, {
        guestName: req.body.guestName,
        guestEmail: req.body.guestEmail,
        phone: req.body.phone,
        address: req.body.address,
      });
      if (!guestParsed.ok) return res.status(400).json({ error: guestParsed.error });
    }

    const validation = await validateAndBuildOrder(req.body, req.user, query);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const payload = validation.payload;

    if (payload.paymentMethod === 'razorpay') {
      if (!req.user) {
        return res.status(400).json({ error: 'Razorpay requires a signed-in account.' });
      }
      const { rows } = await query('SELECT payload FROM store_settings WHERE id = 1');
      const settings = rows[0]?.payload || {};
      const keyId = settings.razorpay?.keyId || process.env.RAZORPAY_KEY_ID;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      const paymentCheck = await verifyRazorpayPayment({
        razorpayPaymentId: req.body.razorpayPaymentId,
        razorpayOrderId: req.body.razorpayOrderId,
        razorpaySignature: req.body.razorpaySignature,
        amount: payload.total,
        keyId,
        secret,
      });

      if (!paymentCheck.valid) {
        return res.status(402).json({ error: paymentCheck.error || 'Payment verification failed.' });
      }

      if (await isRazorpayPaymentUsed(req.body.razorpayPaymentId, query)) {
        return res.status(409).json({ error: 'This payment has already been used for an order.' });
      }

      payload.paymentStatus = 'paid';
      payload.razorpayPaymentId = req.body.razorpayPaymentId || null;
      payload.razorpayOrderId = req.body.razorpayOrderId || null;
    }

    const userId = req.user?.id || null;
    await query(`INSERT INTO orders (id, user_id, payload) VALUES ($1, $2, $3)`, [
      payload.id,
      userId,
      JSON.stringify(payload),
    ]);

    if (validation.promoId) {
      await incrementPromoUse(validation.promoId);
    }

    for (const item of payload.items) {
      await query(
        `UPDATE menu_items SET payload = jsonb_set(
           payload, '{stock}',
           to_jsonb(GREATEST(0, COALESCE((payload->>'stock')::int, 999) - $2))
         ), updated_at = NOW()
         WHERE id = $1 AND payload ? 'stock'`,
        [item.id, item.quantity]
      );
    }

    invalidateStatsCache();
    const { rows: settingsRows } = await query('SELECT payload FROM store_settings WHERE id = 1');
    await notifyOrderPlaced(payload, settingsRows[0]?.payload);
    broadcastOrderEvent({ type: 'order_created', order: payload });

    await logAudit({
      userId: req.user?.id,
      action: 'order.create',
      resource: payload.id,
      details: { total: payload.total, paymentMethod: payload.paymentMethod },
      ip: getClientIp(req),
    });

    return res.status(201).json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save order.' });
  }
});

async function patchOrderStatus(orderId, status, note, req, res) {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const payload = { ...rows[0].payload };
  const history = Array.isArray(payload.statusHistory) ? payload.statusHistory : [];
  history.push({ status, at: new Date().toISOString(), note });
  payload.status = status;
  payload.statusHistory = history;
  payload.updatedAt = new Date().toISOString();

  await query('UPDATE orders SET payload = $1, updated_at = NOW() WHERE id = $2', [
    JSON.stringify(payload),
    orderId,
  ]);

  invalidateStatsCache();
  await notifyOrderStatus(payload, status);
  broadcastOrderEvent({ type: 'order_updated', order: { ...payload, id: orderId } });

  await logAudit({
    userId: req.user?.id,
    action: 'order.status',
    resource: orderId,
    details: { status, note },
    ip: getClientIp(req),
  });

  return res.json({ ...payload, id: orderId, userId: rows[0].user_id });
}

router.post('/:id/confirm-payment', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const payload = { ...rows[0].payload, paymentStatus: 'paid', updatedAt: new Date().toISOString() };
  await query('UPDATE orders SET payload = $1, updated_at = NOW() WHERE id = $2', [
    JSON.stringify(payload),
    req.params.id,
  ]);

  await logAudit({
    userId: req.user.id,
    action: 'order.payment_confirmed',
    resource: req.params.id,
    ip: getClientIp(req),
  });

  return res.json({ ...payload, id: req.params.id });
});

router.post('/:id/assign-driver', authRequired, adminRequired, async (req, res) => {
  const parsed = parseBody(assignDriverSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { driverId, driverName } = parsed.data;
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const payload = {
    ...rows[0].payload,
    driverId: driverId || null,
    driverName: driverName || null,
    updatedAt: new Date().toISOString(),
  };
  await query('UPDATE orders SET payload = $1, updated_at = NOW() WHERE id = $2', [
    JSON.stringify(payload),
    req.params.id,
  ]);
  return res.json({ ...payload, id: req.params.id });
});

const FLOW = {
  delivery: ['pending', 'accepted', 'preparing', 'ready', 'shipped', 'delivered'],
  takeaway: ['pending', 'accepted', 'preparing', 'ready', 'delivered'],
};

router.post('/:id/accept', authRequired, adminRequired, async (req, res) => {
  return patchOrderStatus(req.params.id, 'accepted', req.body.note || 'Order accepted', req, res);
});

router.post('/:id/reject', authRequired, adminRequired, async (req, res) => {
  return patchOrderStatus(req.params.id, 'rejected', req.body.note || 'Order rejected', req, res);
});

router.post('/:id/advance', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const order = rows[0].payload;
  const flow = FLOW[order.orderType === 'takeaway' ? 'takeaway' : 'delivery'];
  const index = flow.indexOf(order.status);
  const next = index >= 0 ? flow[index + 1] : null;
  if (!next) return res.status(400).json({ error: 'No next status available.' });

  return patchOrderStatus(req.params.id, next, req.body.note || `Marked as ${next}`, req, res);
});

router.patch('/:id/status', authRequired, adminRequired, async (req, res) => {
  const parsed = parseBody(orderStatusSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  return patchOrderStatus(req.params.id, parsed.data.status, parsed.data.note, req, res);
});

export default router;
