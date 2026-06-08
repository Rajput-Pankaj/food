import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

function mapOrder(row) {
  return { ...row.payload, id: row.id, userId: row.user_id, createdAt: row.created_at, updatedAt: row.updated_at };
}

router.get('/', authRequired, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const result = isAdmin
    ? await query('SELECT * FROM orders ORDER BY created_at DESC')
    : await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);

  return res.json(result.rows.map(mapOrder));
});

router.get('/:id', authRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });
  if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  return res.json(mapOrder(rows[0]));
});

router.post('/', authRequired, async (req, res) => {
  try {
    const order = req.body;
    if (!order?.id || !Array.isArray(order.items)) {
      return res.status(400).json({ error: 'Invalid order payload.' });
    }

    const statusHistory = [
      { status: order.status || 'pending', at: new Date().toISOString(), note: 'Order placed' },
    ];
    const payload = {
      ...order,
      userId: req.user.id,
      userEmail: req.user.email,
      statusHistory,
      createdAt: order.createdAt || new Date().toISOString(),
    };

    await query(
      `INSERT INTO orders (id, user_id, payload) VALUES ($1, $2, $3)`,
      [order.id, req.user.id, JSON.stringify(payload)]
    );

    return res.status(201).json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save order.' });
  }
});

async function patchOrderStatus(orderId, status, note, res) {
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

  return res.json({ ...payload, id: orderId, userId: rows[0].user_id });
}

const FLOW = {
  delivery: ['pending', 'accepted', 'preparing', 'ready', 'shipped', 'delivered'],
  takeaway: ['pending', 'accepted', 'preparing', 'ready', 'delivered'],
};

router.post('/:id/accept', authRequired, adminRequired, async (req, res) => {
  return patchOrderStatus(req.params.id, 'accepted', req.body.note || 'Order accepted by restaurant', res);
});

router.post('/:id/reject', authRequired, adminRequired, async (req, res) => {
  return patchOrderStatus(req.params.id, 'rejected', req.body.note || 'Order rejected by restaurant', res);
});

router.post('/:id/advance', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });

  const order = rows[0].payload;
  const flow = FLOW[order.orderType === 'takeaway' ? 'takeaway' : 'delivery'];
  const index = flow.indexOf(order.status);
  const next = index >= 0 ? flow[index + 1] : null;
  if (!next) return res.status(400).json({ error: 'No next status available.' });

  return patchOrderStatus(req.params.id, next, req.body.note || `Marked as ${next}`, res);
});

router.patch('/:id/status', authRequired, adminRequired, async (req, res) => {
  const { status, note } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  return patchOrderStatus(req.params.id, status, note || `Status set to ${status}`, res);
});

export default router;
