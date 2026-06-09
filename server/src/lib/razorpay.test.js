import { describe, expect, it, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpayPayment, verifyRazorpaySignature } from './razorpay.js';

describe('verifyRazorpaySignature', () => {
  it('validates correct HMAC signature', () => {
    const secret = 'test_secret';
    const orderId = 'order_123';
    const paymentId = 'pay_456';
    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

    const result = verifyRazorpaySignature({ orderId, paymentId, signature, secret });
    expect(result.valid).toBe(true);
  });
});

describe('verifyRazorpayPayment', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects when signature is missing', async () => {
    const result = await verifyRazorpayPayment({
      razorpayPaymentId: 'pay_1',
      razorpayOrderId: '',
      razorpaySignature: '',
      amount: 500,
      keyId: 'rzp_test',
      secret: 'secret',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/signature/i);
  });

  it('rejects when amount does not match after signature check', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ amount: 10000, status: 'captured' }),
      })
    );

    const secret = 'secret';
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

    const result = await verifyRazorpayPayment({
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      razorpaySignature: signature,
      amount: 500,
      keyId: 'rzp_test',
      secret,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/amount/i);
  });
});
