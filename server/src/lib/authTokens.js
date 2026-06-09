import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const BCRYPT_ROUNDS = 12;
export { BCRYPT_ROUNDS };

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(userId, token) {
  const tokenHash = hashToken(token);
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
}

export async function revokeAllRefreshTokens(userId) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

export async function isRefreshTokenValid(token) {
  const tokenHash = hashToken(token);
  const { rows } = await query(
    `SELECT id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );
  return Boolean(rows[0]);
}

export async function recordFailedLogin(email) {
  const { rows } = await query(
    `UPDATE users SET failed_login_attempts = failed_login_attempts + 1
     WHERE email = $1
     RETURNING failed_login_attempts`,
    [email]
  );
  const attempts = rows[0]?.failed_login_attempts || 0;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    await query(
      `UPDATE users SET locked_until = NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes' WHERE email = $1`,
      [email]
    );
  }
}

export async function clearLoginAttempts(email) {
  await query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1`,
    [email]
  );
}

export async function isAccountLocked(email) {
  const { rows } = await query(
    `SELECT locked_until FROM users WHERE email = $1 AND locked_until > NOW()`,
    [email]
  );
  return Boolean(rows[0]);
}
