import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

function mapPost(row) {
  return { ...row.payload, id: row.id, slug: row.slug };
}

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  return res.json(rows.map(mapPost).filter((post) => post.available !== false));
});

router.get('/admin/all', authRequired, adminRequired, async (_req, res) => {
  const { rows } = await query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  return res.json(rows.map(mapPost));
});

router.get('/slug/:slug', async (req, res) => {
  const { rows } = await query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
  return res.json(mapPost(rows[0]));
});

router.post('/', authRequired, adminRequired, async (req, res) => {
  const post = req.body;
  await query(
    `INSERT INTO blog_posts (id, slug, payload, is_custom) VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, payload = EXCLUDED.payload, is_custom = TRUE, updated_at = NOW()`,
    [post.id, post.slug, JSON.stringify(post)]
  );
  return res.status(201).json(post);
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });
  const updated = { ...rows[0].payload, ...req.body, id: req.params.id };
  await query('UPDATE blog_posts SET payload = $1, slug = $2, updated_at = NOW() WHERE id = $3', [
    JSON.stringify(updated),
    updated.slug,
    req.params.id,
  ]);
  return res.json(updated);
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

export default router;
