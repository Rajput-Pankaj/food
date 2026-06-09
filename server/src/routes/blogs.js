import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { parseBody, blogPostSchema } from '../lib/validation.js';
import { logAudit, getClientIp } from '../lib/audit.js';

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
  const parsed = parseBody(blogPostSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const post = { ...parsed.data, createdAt: new Date().toISOString() };
  await query(
    `INSERT INTO blog_posts (id, slug, payload, is_custom) VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, payload = EXCLUDED.payload, is_custom = TRUE, updated_at = NOW()`,
    [post.id, post.slug, JSON.stringify(post)]
  );
  await logAudit({
    userId: req.user.id,
    action: 'blog.create',
    resource: post.id,
    ip: getClientIp(req),
  });
  return res.status(201).json(post);
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found.' });

  const merged = { ...rows[0].payload, ...req.body, id: req.params.id };
  const parsed = parseBody(blogPostSchema.partial(), merged);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const updated = { ...rows[0].payload, ...parsed.data, id: req.params.id, updatedAt: new Date().toISOString() };
  await query('UPDATE blog_posts SET payload = $1, slug = $2, updated_at = NOW() WHERE id = $3', [
    JSON.stringify(updated),
    updated.slug,
    req.params.id,
  ]);
  return res.json(updated);
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
  await logAudit({
    userId: req.user.id,
    action: 'blog.delete',
    resource: req.params.id,
    ip: getClientIp(req),
  });
  return res.json({ ok: true });
});

export default router;
