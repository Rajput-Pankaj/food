import { Router } from 'express';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { parseBody, userPatchSchema } from '../lib/validation.js';
import { logAudit, getClientIp } from '../lib/audit.js';

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
  const parsed = parseBody(userPatchSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const { name, role } = parsed.data;
  const targetId = req.params.id;

  if (req.user.role !== 'admin' && req.user.id !== targetId) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { rows: beforeRows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);
  if (!beforeRows[0]) return res.status(404).json({ error: 'User not found.' });

  if (name) {
    await query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), targetId]);
  }

  if (role && req.user.role === 'admin') {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, targetId]);
  }

  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [targetId]);

  if (name || role) {
    await logAudit({
      userId: req.user.id,
      action: 'user.update',
      resource: targetId,
      details: {
        before: { name: beforeRows[0].name, role: beforeRows[0].role },
        after: { name: rows[0].name, role: rows[0].role },
      },
      ip: getClientIp(req),
    });
  }

  return res.json(rows[0]);
});

export default router;
