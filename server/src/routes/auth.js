import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import {
  parseBody,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  BCRYPT_ROUNDS,
} from '../lib/validation.js';
import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  isRefreshTokenValid,
  recordFailedLogin,
  clearLoginAttempts,
  isAccountLocked,
} from '../lib/authTokens.js';
import {
  setAccessCookie,
  setRefreshCookie,
  setCsrfCookie,
  clearAuthCookies,
  REFRESH_COOKIE,
} from '../lib/cookies.js';
import { generateCsrfToken } from '../lib/csrf.js';
import { sendPasswordResetEmail } from '../lib/email.js';
import { logAudit, getClientIp } from '../lib/audit.js';
import { hashToken } from '../lib/tokenHash.js';

const router = Router();

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

function registrationAllowed() {
  return process.env.ALLOW_REGISTRATION !== 'false';
}

function toSessionUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

async function issueSession(res, user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);

  const csrfToken = generateCsrfToken();
  setAccessCookie(res, accessToken, req);
  setRefreshCookie(res, refreshToken, req);
  setCsrfCookie(res, csrfToken, req);

  await logAudit({
    userId: user.id,
    action: 'auth.login',
    resource: 'user',
    details: { email: user.email },
    ip: getClientIp(req),
  });

  return { user, csrfToken, token: accessToken };
}

router.get('/csrf', (req, res) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken, req);
  return res.json({ csrfToken });
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    if (!registrationAllowed()) {
      return res.status(403).json({ error: 'Registration is disabled.' });
    }

    const parsed = parseBody(registerSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING id, name, email, role`,
      [name, normalizedEmail, passwordHash]
    );

    const session = await issueSession(res, toSessionUser(rows[0]), req);
    return res.status(201).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const parsed = parseBody(loginSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (await isAccountLocked(normalizedEmail)) {
      return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
    }

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
      await recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await clearLoginAttempts(normalizedEmail);
    const session = await issueSession(res, toSessionUser(record), req);
    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required.' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh token revoked or expired.' });
    }

    const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [
      payload.id,
    ]);
    if (!rows[0]) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'User not found.' });
    }

    await revokeRefreshToken(refreshToken);
    const session = await issueSession(res, toSessionUser(rows[0]), req);
    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Token refresh failed.' });
  }
});

router.post('/logout', optionalAuth, async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) await revokeRefreshToken(refreshToken);
  clearAuthCookies(res);
  if (req.user?.id) {
    await logAudit({
      userId: req.user.id,
      action: 'auth.logout',
      resource: 'user',
      ip: getClientIp(req),
    });
  }
  return res.json({ ok: true });
});

router.get('/me', authRequired, async (req, res) => {
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: toSessionUser(rows[0]) });
});

router.post('/change-password', authRequired, authLimiter, async (req, res) => {
  try {
    const parsed = parseBody(changePasswordSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(parsed.data.currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);
    await revokeAllRefreshTokens(req.user.id);
    clearAuthCookies(res);

    await logAudit({
      userId: req.user.id,
      action: 'auth.password_change',
      resource: 'user',
      ip: getClientIp(req),
    });

    return res.json({ ok: true, message: 'Password updated. Please sign in again.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Password change failed.' });
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const parsed = parseBody(forgotPasswordSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const normalizedEmail = parsed.data.email.toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3`,
      [tokenHash, expires, normalizedEmail]
    );

    const { rows: userRows } = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (userRows[0]) {
      const appUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5180';
      await sendPasswordResetEmail({ to: normalizedEmail, token, appUrl });
    }

    // Always return success to prevent email enumeration
    const isDev = process.env.NODE_ENV !== 'production';
    return res.json({
      ok: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(isDev ? { resetToken: token } : {}),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Request failed.' });
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const parsed = parseBody(resetPasswordSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const { rows } = await query(
      `SELECT id FROM users
       WHERE password_reset_token = $1 AND password_reset_expires > NOW()`,
      [hashToken(parsed.data.token)]
    );
    if (!rows[0]) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
    await query(
      `UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL
       WHERE id = $2`,
      [passwordHash, rows[0].id]
    );
    await revokeAllRefreshTokens(rows[0].id);

    return res.json({ ok: true, message: 'Password reset successful. Please sign in.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Password reset failed.' });
  }
});

export default router;
