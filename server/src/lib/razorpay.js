import crypto from 'crypto';

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (!secret) {
    return { valid: false, error: 'Razorpay secret key is not configured on the server.' };
  }
  if (!orderId || !paymentId || !signature) {
    return { valid: false, error: 'Incomplete Razorpay payment details.' };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (!timingSafeEqual(expected, signature)) {
    return { valid: false, error: 'Invalid Razorpay payment signature.' };
  }

  return { valid: true };
}

export async function fetchRazorpayPayment(paymentId, keyId, secret) {
  const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    return { ok: false, error: 'Unable to verify payment with Razorpay.' };
  }

  const payment = await response.json();
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    return { ok: false, error: 'Payment was not successful.' };
  }

  return { ok: true, payment };
}

export async function isRazorpayPaymentUsed(paymentId, queryFn) {
  const { rows } = await queryFn(
    `SELECT id FROM orders WHERE payload->>'razorpayPaymentId' = $1 LIMIT 1`,
    [paymentId]
  );
  return rows.length > 0;
}

export async function verifyRazorpayPayment({
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
  amount,
  keyId,
  secret,
}) {
  if (!keyId || !secret) {
    return { valid: false, error: 'Razorpay is not configured on the server.' };
  }

  if (!razorpayOrderId || !razorpaySignature) {
    return { valid: false, error: 'Razorpay order ID and signature are required.' };
  }

  const sig = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    secret,
  });
  if (!sig.valid) return sig;

  const fetched = await fetchRazorpayPayment(razorpayPaymentId, keyId, secret);
  if (!fetched.ok) return { valid: false, error: fetched.error };

  const paidAmount = Number(fetched.payment.amount) / 100;
  if (Math.abs(paidAmount - Number(amount)) > 0.01) {
    return { valid: false, error: 'Payment amount does not match order total.' };
  }

  if (fetched.payment.status !== 'captured' && fetched.payment.status !== 'authorized') {
    return { valid: false, error: 'Payment was not successful.' };
  }

  return { valid: true };
}
