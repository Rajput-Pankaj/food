import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authRequired, signToken } from '../middleware/auth.js';

const router = Router();

function toSessionUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING id, name, email, role`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = toSessionUser(rows[0]);
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const { rows } = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [normalizedEmail]
    );

    const record = rows[0];
    if (!record) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, record.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = toSessionUser(record);
    const token = signToken(user);
    return res.json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: toSessionUser(rows[0]) });
});

export default router;
