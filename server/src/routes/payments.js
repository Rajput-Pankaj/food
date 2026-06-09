import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { verifyRazorpayPayment, isRazorpayPaymentUsed } from '../lib/razorpay.js';
import { parseBody, razorpayVerifySchema } from '../lib/validation.js';

const router = Router();

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment verification attempts.' },
});

router.post('/razorpay/verify', verifyLimiter, authRequired, async (req, res) => {
  const parsed = parseBody(razorpayVerifySchema, req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  if (await isRazorpayPaymentUsed(parsed.data.razorpayPaymentId, query)) {
    return res.status(409).json({ error: 'This payment has already been used.' });
  }

  const { rows } = await query('SELECT payload FROM store_settings WHERE id = 1');
  const settings = rows[0]?.payload || {};
  const keyId = settings.razorpay?.keyId || process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const result = await verifyRazorpayPayment({
    ...parsed.data,
    keyId,
    secret,
  });

  if (!result.valid) {
    return res.status(402).json({ error: result.error || 'Payment verification failed.' });
  }

  return res.json({ verified: true });
});

export default router;
