import crypto from 'crypto';

export const SETUP_SESSION_COOKIE = 'fe_setup_session';
const SESSION_TTL_MS = 30 * 60 * 1000;

function sessionSecret() {
  return process.env.SETUP_TOKEN || process.env.JWT_SECRET || '';
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function createSetupSessionToken() {
  const payload = {
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const secret = sessionSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySetupSessionToken(token) {
  if (!token || !sessionSecret()) return false;

  const [data, sig] = token.split('.');
  if (!data || !sig) return false;

  const expected = crypto.createHmac('sha256', sessionSecret()).update(data).digest('base64url');
  if (!timingSafeEqual(sig, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export { SESSION_TTL_MS };
