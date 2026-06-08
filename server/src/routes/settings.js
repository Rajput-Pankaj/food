import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT payload FROM store_settings WHERE id = 1');
  return res.json(rows[0]?.payload || {});
});

router.put('/', authRequired, adminRequired, async (req, res) => {
  const payload = { ...req.body, updatedAt: new Date().toISOString() };
  await query(
    `INSERT INTO store_settings (id, payload) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(payload)]
  );
  return res.json(payload);
});

export default router;
