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

function parseDateParam(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function safeTimeZone(tz) {
  if (!tz || typeof tz !== 'string') return 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

const HOUR_BUCKET_MAX_MS = 48 * 3600 * 1000;

async function computeStats({ from, to, tz }) {
  const hasRange = Boolean(from && to);
  const rangeParams = hasRange ? [from.toISOString(), to.toISOString()] : [];
  const where = hasRange ? 'WHERE created_at >= $1 AND created_at <= $2' : '';

  const bucket = hasRange && to - from <= HOUR_BUCKET_MAX_MS ? 'hour' : 'day';
  const bucketFormat = bucket === 'hour' ? 'YYYY-MM-DD"T"HH24' : 'YYYY-MM-DD';
  const trendWhere = hasRange
    ? `${where} AND payload->>'status' NOT IN ('rejected', 'cancelled')`
    : `WHERE created_at >= NOW() - INTERVAL '6 days' AND payload->>'status' NOT IN ('rejected', 'cancelled')`;
  const tzIndex = rangeParams.length + 1;

  const [totals, byStatus, trend, recent] = await Promise.all([
    query(
      `SELECT
         COUNT(*)::int AS total_orders,
         COUNT(*) FILTER (WHERE payload->>'status' = 'pending')::int AS pending_count,
         COALESCE(SUM((payload->>'total')::numeric) FILTER (
           WHERE payload->>'status' NOT IN ('rejected', 'cancelled')
         ), 0)::float AS revenue
       FROM orders ${where}`,
      rangeParams
    ),
    query(
      `SELECT payload->>'status' AS status, COUNT(*)::int AS count
       FROM orders ${where} GROUP BY payload->>'status'`,
      rangeParams
    ),
    query(
      `SELECT
         to_char(created_at AT TIME ZONE $${tzIndex}, '${bucketFormat}') AS key,
         COUNT(*)::int AS orders,
         COALESCE(SUM((payload->>'total')::numeric), 0)::float AS revenue
       FROM orders ${trendWhere}
       GROUP BY key ORDER BY key`,
      [...rangeParams, tz]
    ),
    query(
      `SELECT id, user_id, payload, created_at FROM orders ${where}
       ORDER BY created_at DESC LIMIT 8`,
      rangeParams
    ),
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

  const revenueTrend = trend.rows.map((r) => ({
    date: r.key,
    revenue: Number(r.revenue) || 0,
    orders: r.orders || 0,
  }));

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
    trendBucket: bucket,
    range: {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
    },
    recentOrders,
  };
}

router.get('/stats', authRequired, adminRequired, async (req, res) => {
  let from = parseDateParam(req.query.from);
  let to = parseDateParam(req.query.to);
  const tz = safeTimeZone(req.query.tz);
  if (!from || !to || from > to) {
    from = null;
    to = null;
  }

  const cacheKey = `${from?.toISOString() || 'all'}|${to?.toISOString() || 'all'}|${tz}`;
  const cached = getCachedStats(cacheKey);
  if (cached) return res.json(cached);

  const stats = await computeStats({ from, to, tz });
  setCachedStats(cacheKey, stats);
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
