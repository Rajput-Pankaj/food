import { Router } from 'express';
import { query } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authRequired, async (req, res) => {
  const { rows } = await query('SELECT payload FROM customer_profiles WHERE user_id = $1', [req.user.id]);
  return res.json(rows[0]?.payload || { phone: '', dietaryPreference: null });
});

router.put('/profile', authRequired, async (req, res) => {
  const payload = req.body;
  await query(
    `INSERT INTO customer_profiles (user_id, payload) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [req.user.id, JSON.stringify(payload)]
  );
  return res.json(payload);
});

router.get('/addresses', authRequired, async (req, res) => {
  const { rows } = await query(
    'SELECT id, payload FROM customer_addresses WHERE user_id = $1 ORDER BY created_at ASC',
    [req.user.id]
  );
  return res.json(rows.map((row) => ({ ...row.payload, id: row.id })));
});

router.post('/addresses', authRequired, async (req, res) => {
  const id = req.body.id || crypto.randomUUID();
  const payload = { ...req.body, id };
  await query(
    `INSERT INTO customer_addresses (id, user_id, payload) VALUES ($1, $2, $3)`,
    [id, req.user.id, JSON.stringify(payload)]
  );
  return res.status(201).json(payload);
});

router.put('/addresses/:id', authRequired, async (req, res) => {
  const payload = { ...req.body, id: req.params.id };
  await query(
    'UPDATE customer_addresses SET payload = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
    [JSON.stringify(payload), req.params.id, req.user.id]
  );
  return res.json(payload);
});

router.delete('/addresses/:id', authRequired, async (req, res) => {
  await query('DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.user.id,
  ]);
  return res.json({ ok: true });
});

router.get('/reviews', authRequired, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const result = isAdmin
    ? await query('SELECT id, user_id, payload, created_at FROM reviews ORDER BY created_at DESC')
    : await query(
        'SELECT id, user_id, payload, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
  return res.json(
    result.rows.map((row) => ({
      ...row.payload,
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
    }))
  );
});

router.post('/reviews', authRequired, async (req, res) => {
  const id = req.body.id || crypto.randomUUID();
  const payload = { ...req.body, id, userId: req.user.id, createdAt: new Date().toISOString() };
  await query(
    `INSERT INTO reviews (id, user_id, payload) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [id, req.user.id, JSON.stringify(payload)]
  );
  return res.status(201).json(payload);
});

router.delete('/reviews/:id', authRequired, async (req, res) => {
  const clause = req.user.role === 'admin' ? 'id = $1' : 'id = $1 AND user_id = $2';
  const params = req.user.role === 'admin' ? [req.params.id] : [req.params.id, req.user.id];
  await query(`DELETE FROM reviews WHERE ${clause}`, params);
  return res.json({ ok: true });
});

export default router;
