import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../db.js';
import { parseBody, setupSchema, BCRYPT_ROUNDS } from '../lib/validation.js';
import { seedDatabase } from '../db/seed.js';
import { logAudit, getClientIp } from '../lib/audit.js';
import { verifySetupToken } from '../lib/setupToken.js';

const router = Router();

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many setup attempts. Please try again later.' },
});

async function isSetupComplete() {
  const { rows } = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
  const meta = await query(`SELECT value FROM app_meta WHERE key = 'setup_complete'`);
  return rows[0].count > 0 || meta.rows[0]?.value?.done === true;
}

router.get('/status', async (_req, res) => {
  const complete = await isSetupComplete();
  return res.json({ setupComplete: complete, needsSetup: !complete });
});

router.post('/complete', setupLimiter, async (req, res) => {
  try {
    const parsed = parseBody(setupSchema, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const setupToken = parsed.data.setupToken || req.headers['x-setup-token'];
    const tokenValid = await verifySetupToken(setupToken);
    if (!tokenValid) {
      return res.status(403).json({ error: 'Invalid or missing setup token.' });
    }

    const {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      adminName,
      adminEmail,
      adminPassword,
      loadSampleMenu,
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
        [JSON.stringify({ done: true, at: new Date().toISOString() })]
      );
    });

    if (loadSampleMenu) {
      process.env.SEED_DEMO_USERS = 'false';
      await seedDatabase();
    }

    await logAudit({
      userId: null,
      action: 'setup.complete',
      resource: 'system',
      details: { adminEmail: normalizedEmail },
      ip: getClientIp(req),
    });

    return res.status(201).json({ ok: true, message: 'Setup complete. Please sign in.' });
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
