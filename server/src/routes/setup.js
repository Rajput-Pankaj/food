import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../db.js';
import { parseBody, setupSchema, BCRYPT_ROUNDS } from '../lib/validation.js';
import { seedDatabase } from '../db/seed.js';
import { logAudit, getClientIp } from '../lib/audit.js';
import { verifySetupToken } from '../lib/setupToken.js';
import {
  createSetupSessionToken,
  verifySetupSessionToken,
  SESSION_TTL_MS,
} from '../lib/setupSession.js';
import {
  SETUP_SESSION_COOKIE,
  setSetupSessionCookie,
  clearSetupSessionCookie,
} from '../lib/cookies.js';
import { applyDomainDeployConfig, isDeployEnvWritable } from '../lib/deployConfig.js';

const router = Router();

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many setup attempts. Please try again later.' },
});

const beginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many setup sessions. Please try again later.' },
});

async function isSetupComplete() {
  const { rows } = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
  const meta = await query(`SELECT value FROM app_meta WHERE key = 'setup_complete'`);
  return rows[0].count > 0 || meta.rows[0]?.value?.done === true;
}

async function isSetupAuthorized(req) {
  const setupToken = req.body?.setupToken || req.headers['x-setup-token'];
  if (setupToken && (await verifySetupToken(setupToken))) return true;
  const session = req.cookies?.[SETUP_SESSION_COOKIE];
  return verifySetupSessionToken(session);
}

router.get('/context', async (req, res) => {
  const complete = await isSetupComplete();
  const authorized = verifySetupSessionToken(req.cookies?.[SETUP_SESSION_COOKIE]);
  const traefikAvailable = process.env.TRAEFIK_AVAILABLE === 'true';
  const domain = process.env.DOMAIN || '';

  return res.json({
    setupComplete: complete,
    needsSetup: !complete,
    authorized,
    autoSetupAvailable: !complete,
    traefikAvailable,
    deployEnvWritable: isDeployEnvWritable(),
    publicUrl: process.env.APP_URL || '',
    appPort: process.env.APP_PORT || '8080',
    domain,
    dbReady: true,
  });
});

router.post('/begin', beginLimiter, async (req, res) => {
  if (await isSetupComplete()) {
    return res.status(403).json({ error: 'Setup already completed.' });
  }

  const sessionToken = createSetupSessionToken();
  setSetupSessionCookie(res, sessionToken, req);

  return res.json({
    ok: true,
    authorized: true,
    expiresIn: SESSION_TTL_MS,
    message: 'Setup session started. Complete the wizard within 30 minutes.',
  });
});

router.post('/verify-token', setupLimiter, async (req, res) => {
  if (await isSetupComplete()) {
    return res.status(403).json({ valid: false, error: 'Setup already completed.' });
  }
  const setupToken = req.body?.setupToken || req.headers['x-setup-token'];
  const valid = await verifySetupToken(setupToken);
  if (!valid) {
    return res.status(403).json({ valid: false, error: 'Invalid setup token.' });
  }
  return res.json({ valid: true });
});

router.post('/complete', setupLimiter, async (req, res) => {
  try {
    if (!(await isSetupAuthorized(req))) {
      return res.status(403).json({ error: 'Setup session expired. Refresh and try again.' });
    }

    const parsed = parseBody(setupSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      adminName,
      adminEmail,
      adminPassword,
      loadSampleMenu,
      domain,
    } = parsed.data;

    const normalizedEmail = adminEmail.toLowerCase();

    await withTransaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(867530901)');

      const adminCount = await client.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`
      );
      const meta = await client.query(`SELECT value FROM app_meta WHERE key = 'setup_complete'`);
      const complete = adminCount.rows[0].count > 0 || meta.rows[0]?.value?.done === true;
      if (complete) {
        const err = new Error('SETUP_COMPLETE');
        err.code = 'SETUP_COMPLETE';
        throw err;
      }

      const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length) {
        const err = new Error('EMAIL_EXISTS');
        err.code = 'EMAIL_EXISTS';
        throw err;
      }

      const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
        [adminName, normalizedEmail, passwordHash]
      );

      const settings = {
        storeName,
        storeAddress,
        storePhone,
        storeEmail: storeEmail || '',
        deliveryFee: 49,
        freeDeliveryThreshold: 500,
        deliveryEnabled: true,
        takeawayEnabled: true,
        enabledPaymentMethods: ['cod', 'upi', 'razorpay'],
        guestCheckoutEnabled: true,
        darkModeEnabled: true,
        storeLogo: '',
        upi: { vpa: '', payeeName: storeName },
        razorpay: { keyId: '', enabled: false },
        deliveryZones: [],
        updatedAt: new Date().toISOString(),
      };

      await client.query(
        `INSERT INTO store_settings (id, payload) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [JSON.stringify(settings)]
      );

      await client.query(
        `INSERT INTO app_meta (key, value) VALUES ('setup_complete', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify({ done: true, at: new Date().toISOString(), domain: domain || null })]
      );

      await client.query(`DELETE FROM app_meta WHERE key = 'setup_token_hash'`);
    });

    if (loadSampleMenu) {
      process.env.SEED_DEMO_USERS = 'false';
      await seedDatabase();
    }

    let domainResult = null;
    if (domain?.trim()) {
      domainResult = applyDomainDeployConfig(domain);
    }

    clearSetupSessionCookie(res);

    await logAudit({
      userId: null,
      action: 'setup.complete',
      resource: 'system',
      details: { adminEmail: normalizedEmail, domain: domain || null },
      ip: getClientIp(req),
    });

    return res.status(201).json({
      ok: true,
      message: 'Setup complete. Please sign in.',
      domainConfigured: Boolean(domainResult?.ok),
      appUrl: domainResult?.appUrl || process.env.APP_URL || '',
      redeployRequired: Boolean(domainResult?.redeployRequired),
      redeployCommand: domainResult?.redeployCommand || './scripts/deploy.sh',
    });
  } catch (error) {
    if (error.code === 'SETUP_COMPLETE') {
      return res.status(403).json({ error: 'Setup already completed.' });
    }
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Admin email already exists.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Setup failed.' });
  }
});

export default router;
