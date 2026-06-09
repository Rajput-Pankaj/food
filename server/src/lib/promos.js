import { query } from '../db.js';

export async function validatePromoCode(code, subtotal) {
  if (!code) return { ok: true, discount: 0, promo: null };

  const { rows } = await query(
    `SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1) AND active = TRUE`,
    [code.trim()]
  );
  const row = rows[0];
  if (!row) return { ok: false, error: 'Invalid promo code.' };

  const promo = row.payload;
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { ok: false, error: 'Promo code has expired.' };
  }
  if (promo.minOrder && subtotal < promo.minOrder) {
    return { ok: false, error: `Minimum order ₹${promo.minOrder} required for this promo.` };
  }
  if (promo.maxUses > 0 && (promo.usedCount || 0) >= promo.maxUses) {
    return { ok: false, error: 'Promo code usage limit reached.' };
  }

  let discount = 0;
  if (promo.discountType === 'percent') {
    discount = Math.round((subtotal * promo.discountValue) / 100);
  } else if (promo.discountType === 'fixed') {
    discount = Math.min(promo.discountValue, subtotal);
  }

  return { ok: true, discount, promo: { code: row.code, ...promo }, promoId: row.id };
}

export async function incrementPromoUse(promoId) {
  if (!promoId) return;
  await query(
    `UPDATE promo_codes SET payload = jsonb_set(
       COALESCE(payload, '{}'::jsonb),
       '{usedCount}',
       to_jsonb(COALESCE((COALESCE(payload, '{}'::jsonb)->>'usedCount')::int, 0) + 1)
     ), updated_at = NOW() WHERE id = $1`,
    [promoId]
  );
}
