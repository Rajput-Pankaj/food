import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { resetDemoData } from '../db/seed.js';

const router = Router();

router.post('/seed', authRequired, adminRequired, async (_req, res) => {
  await resetDemoData();
  return res.json({ ok: true, message: 'Demo data reset and re-seeded.' });
});

router.get('/stats', authRequired, adminRequired, async (_req, res) => {
  const [orders, menu, blogs, reviews, users] = await Promise.all([
    query('SELECT payload FROM orders ORDER BY created_at DESC'),
    query('SELECT id FROM menu_items'),
    query('SELECT payload FROM blog_posts'),
    query('SELECT payload FROM reviews'),
    query('SELECT id, role FROM users'),
  ]);

  const orderRows = orders.rows.map((row) => row.payload);
  const revenue = orderRows
    .filter((order) => order.status !== 'rejected' && order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const byStatus = orderRows.reduce((acc, order) => {
    const key = order.status || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const pendingCount = orderRows.filter((order) => order.status === 'pending').length;

  return res.json({
    totalOrders: orderRows.length,
    revenue,
    byStatus,
    pendingCount,
    recentOrders: orderRows.slice(0, 5),
    menuCount: menu.rows.length,
    blogCount: blogs.rows.filter((row) => row.payload.available !== false).length,
    reviewCount: reviews.rows.length,
    customerCount: users.rows.filter((user) => user.role === 'customer').length,
  });
});

export default router;
