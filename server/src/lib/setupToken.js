import crypto from 'crypto';
import { query } from '../db.js';

const META_KEY = 'setup_token_hash';

export async function ensureSetupToken() {
  const { rows } = await query(`SELECT value FROM app_meta WHERE key = $1`, [META_KEY]);
  if (rows[0]?.value?.hash) return;

  const token = process.env.SETUP_TOKEN || crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  await query(
    `INSERT INTO app_meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO NOTHING`,
    [META_KEY, JSON.stringify({ hash, createdAt: new Date().toISOString() })]
  );

  if (!process.env.SETUP_TOKEN && process.env.NODE_ENV !== 'production') {
    console.log('[setup] One-time setup token (dev):', token);
  } else if (process.env.SETUP_TOKEN) {
    console.log('[setup] Setup token configured via SETUP_TOKEN env.');
  } else {
    console.warn('[setup] SETUP_TOKEN not set in production — generate one and set in .env before exposing setup.');
  }
}

export async function verifySetupToken(token) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction && !process.env.SETUP_TOKEN) {
    const { rows } = await query(`SELECT value FROM app_meta WHERE key = $1`, [META_KEY]);
    if (!rows[0]?.value?.hash) return true;
  }

  if (!token) return false;
  const { rows } = await query(`SELECT value FROM app_meta WHERE key = $1`, [META_KEY]);
  const expected = rows[0]?.value?.hash;
  if (!expected) return false;

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  if (hash.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
}
