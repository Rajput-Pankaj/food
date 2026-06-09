import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { resetDemoData } from '../db/seed.js';
import { getCachedStats, setCachedStats, invalidateStatsCache } from '../lib/statsCache.js';
import { logAudit, getClientIp } from '../lib/audit.js';

const router = Router();
const isProduction = process.env.NODE_ENV === 'production';

router.post('/seed', authRequired, adminRequired, async (req, res) => {
  if (isProduction) {
    return res.status(403).json({ error: 'Seed API is disabled in production.' });
  }
  await resetDemoData();
  invalidateStatsCache();
  await logAudit({
    userId: req.user.id,
    action: 'admin.seed',
    resource: 'database',
    ip: getClientIp(req),
  });
  return res.json({ ok: true, message: 'Demo data reset and re-seeded.' });
});

async function computeStats() {
  const [totals, byStatus, trend, recent] = await Promise.all([
    query(`
      SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE payload->>'status' = 'pending')::int AS pending_count,
        COALESCE(SUM((payload->>'total')::numeric) FILTER (
          WHERE payload->>'status' NOT IN ('rejected', 'cancelled')
        ), 0)::float AS revenue
      FROM orders
    `),
    query(`
      SELECT payload->>'status' AS status, COUNT(*)::int AS count
      FROM orders GROUP BY payload->>'status'
    `),
    query(`
      SELECT
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS orders,
        COALESCE(SUM((payload->>'total')::numeric), 0)::float AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 days'
        AND payload->>'status' NOT IN ('rejected', 'cancelled')
      GROUP BY day ORDER BY day
    `),
    query(`
      SELECT id, user_id, payload, created_at FROM orders
      ORDER BY created_at DESC LIMIT 8
    `),
  ]);

  const row = totals.rows[0];
  const revenue = Number(row.revenue) || 0;
  const totalOrders = row.total_orders || 0;
  const pendingCount = row.pending_count || 0;
  const countable = totalOrders - (byStatus.rows.find((r) => r.status === 'rejected')?.count || 0)
    - (byStatus.rows.find((r) => r.status === 'cancelled')?.count || 0);
  const avgOrderValue = countable > 0 ? Math.round(revenue / countable) : 0;

  const statusMap = byStatus.rows.reduce((acc, r) => {
    acc[r.status || 'unknown'] = r.count;
    return acc;
  }, {});

  const revenueTrend = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const trendMap = Object.fromEntries(trend.rows.map((r) => [r.day, r]));

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const dayData = trendMap[key];
    revenueTrend.push({
      date: key,
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      shortLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: Number(dayData?.revenue) || 0,
      orders: dayData?.orders || 0,
    });
  }

  const recentOrders = recent.rows.map((r) => ({
    ...r.payload,
    id: r.id,
    userId: r.user_id,
    createdAt: r.created_at,
  }));

  return {
    totalOrders,
    revenue,
    avgOrderValue,
    byStatus: statusMap,
    pendingCount,
    revenueTrend,
    recentOrders,
  };
}

router.get('/stats', authRequired, adminRequired, async (_req, res) => {
  const cached = getCachedStats();
  if (cached) return res.json(cached);

  const stats = await computeStats();
  setCachedStats(stats);
  return res.json(stats);
});

router.get('/audit', authRequired, adminRequired, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const { rows } = await query(
    `SELECT a.*, u.name AS user_name, u.email AS user_email
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );
  return res.json(rows);
});

router.get('/contacts', authRequired, adminRequired, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const { rows } = await query(
    'SELECT id, payload, read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return res.json(rows.map((r) => ({ id: r.id, ...r.payload, read: r.read, createdAt: r.created_at })));
});

router.patch('/contacts/:id/read', authRequired, adminRequired, async (req, res) => {
  await query('UPDATE contact_messages SET read = TRUE WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

router.get('/export/orders', authRequired, adminRequired, async (_req, res) => {
  const { rows } = await query('SELECT id, payload, created_at FROM orders ORDER BY created_at DESC');
  const header = 'id,date,status,total,payment,phone,email\n';
  const lines = rows.map((r) => {
    const o = r.payload;
    return [
      r.id,
      new Date(r.created_at).toISOString(),
      o.status,
      o.total,
      o.paymentMethod,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      o.userEmail || o.guestEmail || '',
    ].join(',');
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
  return res.send(header + lines.join('\n'));
});

export default router;
