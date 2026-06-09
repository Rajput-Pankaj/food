import { describe, expect, it } from 'vitest';
import {
  parseBody,
  registerSchema,
  settingsSchema,
  sanitizePublicSettings,
  loginSchema,
} from './validation.js';

describe('validation', () => {
  it('rejects weak passwords on register', () => {
    const result = parseBody(registerSchema, {
      name: 'Test',
      email: 'a@b.com',
      password: 'short',
    });
    expect(result.ok).toBe(false);
  });

  it('accepts strong passwords on register', () => {
    const result = parseBody(registerSchema, {
      name: 'Test',
      email: 'a@b.com',
      password: 'Password1',
    });
    expect(result.ok).toBe(true);
  });

  it('accepts valid login', () => {
    const result = parseBody(loginSchema, {
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.ok).toBe(true);
  });

  it('strips razorpay secret from public settings', () => {
    const publicSettings = sanitizePublicSettings({
      storeName: 'Test',
      razorpay: { keyId: 'rzp_test', enabled: true, keySecret: 'secret' },
    });
    expect(publicSettings.razorpay.keyId).toBe('rzp_test');
    expect(publicSettings.razorpay.keySecret).toBeUndefined();
  });

  it('validates settings payload', () => {
    const result = parseBody(settingsSchema, {
      storeName: 'FoodExpress',
      deliveryFee: 49,
      enabledPaymentMethods: ['cod', 'upi'],
    });
    expect(result.ok).toBe(true);
  });
});
