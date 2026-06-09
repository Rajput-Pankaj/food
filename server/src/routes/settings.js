import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { parseBody, settingsSchema, sanitizePublicSettings } from '../lib/validation.js';
import { logAudit, getClientIp } from '../lib/audit.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT payload FROM store_settings WHERE id = 1');
  return res.json(sanitizePublicSettings(rows[0]?.payload || {}));
});

router.put('/', authRequired, adminRequired, async (req, res) => {
  const parsed = parseBody(settingsSchema.partial(), req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { rows } = await query('SELECT payload FROM store_settings WHERE id = 1');
  const current = rows[0]?.payload || {};
  const merged = {
    ...current,
    ...parsed.data,
    upi: { ...(current.upi || {}), ...(parsed.data.upi || {}) },
    razorpay: { ...(current.razorpay || {}), ...(parsed.data.razorpay || {}) },
    updatedAt: new Date().toISOString(),
  };

  if (merged.razorpay) {
    merged.razorpay = { keyId: merged.razorpay.keyId || '', enabled: Boolean(merged.razorpay.enabled) };
  }

  await query(
    `INSERT INTO store_settings (id, payload) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(merged)]
  );

  await logAudit({
    userId: req.user.id,
    action: 'settings.update',
    resource: 'store_settings',
    ip: getClientIp(req),
  });

  return res.json(sanitizePublicSettings(merged));
});

export default router;
