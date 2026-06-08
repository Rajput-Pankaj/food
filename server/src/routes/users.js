import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, adminRequired, async (_req, res) => {
  const { rows } = await query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return res.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    }))
  );
});

router.patch('/:id', authRequired, async (req, res) => {
  const { name, role } = req.body;
  const targetId = req.params.id;

  if (req.user.role !== 'admin' && req.user.id !== targetId) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  if (name) {
    await query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), targetId]);
  }

  if (role && req.user.role === 'admin') {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, targetId]);
  }

  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
  return res.json(rows[0]);
});

export default router;
