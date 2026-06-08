import { readFile } from 'fs/promises';
import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

function mapMenuItem(row) {
  return { ...row.payload, id: row.id };
}

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM menu_items ORDER BY id ASC');
  const items = rows.map(mapMenuItem).filter((item) => item.available !== false);
  return res.json(items);
});

router.get('/admin/all', authRequired, adminRequired, async (_req, res) => {
  const { rows } = await query('SELECT * FROM menu_items ORDER BY id ASC');
  return res.json(rows.map(mapMenuItem));
});

router.get('/:id', async (req, res) => {
  const { rows } = await query('SELECT * FROM menu_items WHERE id = $1', [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Menu item not found.' });
  return res.json(mapMenuItem(rows[0]));
});

router.post('/', authRequired, adminRequired, async (req, res) => {
  const item = req.body;
  const id = Number(item.id) || Date.now();
  await query(
    `INSERT INTO menu_items (id, payload, is_custom) VALUES ($1, $2, TRUE)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, is_custom = TRUE, updated_at = NOW()`,
    [id, JSON.stringify({ ...item, id, available: item.available !== false })]
  );
  return res.status(201).json({ ...item, id });
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Menu item not found.' });

  const updated = { ...rows[0].payload, ...req.body, id };
  await query('UPDATE menu_items SET payload = $1, updated_at = NOW() WHERE id = $2', [
    JSON.stringify(updated),
    id,
  ]);
  return res.json(updated);
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  const id = Number(req.params.id);
  await query('DELETE FROM menu_items WHERE id = $1 AND is_custom = TRUE', [id]);
  return res.json({ ok: true });
});

router.post('/reset-seed', authRequired, adminRequired, async (_req, res) => {
  await query('DELETE FROM menu_items WHERE is_custom = TRUE');
  const menuItems = JSON.parse(
    await readFile(new URL('../../seed/menu-items.json', import.meta.url), 'utf8')
  );
  for (const item of menuItems) {
    await query(
      `INSERT INTO menu_items (id, payload, is_custom) VALUES ($1, $2, FALSE)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, is_custom = FALSE, updated_at = NOW()`,
      [item.id, JSON.stringify(item)]
    );
  }
  return res.json({ ok: true, count: menuItems.length });
});

export default router;
