import { Router } from 'express';
import { query } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const { rows } = await query(
    `SELECT m.id, m.payload FROM favorites f
     JOIN menu_items m ON m.id = f.menu_item_id
     WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  return res.json(rows.map((row) => ({ ...row.payload, id: row.id })));
});

router.post('/:menuItemId', authRequired, async (req, res) => {
  const menuItemId = Number(req.params.menuItemId);
  const { rows } = await query('SELECT id FROM menu_items WHERE id = $1', [menuItemId]);
  if (!rows[0]) return res.status(404).json({ error: 'Menu item not found.' });

  await query(
    `INSERT INTO favorites (user_id, menu_item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.user.id, menuItemId]
  );
  return res.status(201).json({ ok: true, menuItemId });
});

router.delete('/:menuItemId', authRequired, async (req, res) => {
  await query('DELETE FROM favorites WHERE user_id = $1 AND menu_item_id = $2', [
    req.user.id,
    Number(req.params.menuItemId),
  ]);
  return res.json({ ok: true });
});

export default router;
