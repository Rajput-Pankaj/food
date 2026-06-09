import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { parseBody, contactSchema } from '../lib/validation.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions. Please try again later.' },
});

router.post('/', contactLimiter, async (req, res) => {
  const parsed = parseBody(contactSchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const payload = {
    ...parsed.data,
    createdAt: new Date().toISOString(),
    ip: req.ip,
  };

  await query('INSERT INTO contact_messages (payload) VALUES ($1)', [JSON.stringify(payload)]);
  return res.status(201).json({ ok: true, message: 'Message received. We will get back to you soon.' });
});

export default router;
