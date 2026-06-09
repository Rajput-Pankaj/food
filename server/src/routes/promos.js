import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { parseBody, promoCodeSchema, promoValidateSchema } from '../lib/validation.js';
import { logAudit, getClientIp } from '../lib/audit.js';

const router = Router();

const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many promo validation attempts.' },
});

router.get('/', authRequired, adminRequired, async (_req, res) => {
  const { rows } = await query('SELECT * FROM promo_codes ORDER BY created_at DESC');
  return res.json(
    rows.map((row) => ({
      id: row.id,
      code: row.code,
      active: row.active,
      ...row.payload,
    }))
  );
});

router.post('/validate', validateLimiter, async (req, res) => {
  const parsed = parseBody(promoValidateSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { validatePromoCode } = await import('../lib/promos.js');
  const result = await validatePromoCode(parsed.data.code, parsed.data.subtotal);
  if (!result.ok) return res.status(400).json({ error: result.error });
  return res.json({
    valid: true,
    discount: result.discount,
    code: result.promo?.code,
    discountType: result.promo?.discountType,
  });
});

router.post('/', authRequired, adminRequired, async (req, res) => {
  const parsed = parseBody(promoCodeSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const id = crypto.randomUUID();
  const code = parsed.data.code.toUpperCase();
  const payload = { ...parsed.data, usedCount: 0 };

  try {
    await query(
      `INSERT INTO promo_codes (id, code, payload) VALUES ($1, $2, $3)`,
      [id, code, JSON.stringify(payload)]
    );
    await logAudit({
      userId: req.user.id,
      action: 'promo.create',
      resource: code,
      ip: getClientIp(req),
    });
    return res.status(201).json({ id, code, ...payload });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Promo code already exists.' });
    }
    throw error;
  }
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  const parsed = parseBody(promoCodeSchema.partial(), req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { rows } = await query('SELECT * FROM promo_codes WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Promo not found.' });

  const payload = { ...rows[0].payload, ...parsed.data };
  const active = parsed.data.active !== undefined ? Boolean(parsed.data.active) : rows[0].active;

  await query(
    'UPDATE promo_codes SET payload = $1, active = $2, updated_at = NOW() WHERE id = $3',
    [JSON.stringify(payload), active, req.params.id]
  );
  return res.json({ id: req.params.id, code: rows[0].code, active, ...payload });
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM promo_codes WHERE id = $1', [req.params.id]);
  await logAudit({
    userId: req.user.id,
    action: 'promo.delete',
    resource: req.params.id,
    ip: getClientIp(req),
  });
  return res.json({ ok: true });
});

export default router;
