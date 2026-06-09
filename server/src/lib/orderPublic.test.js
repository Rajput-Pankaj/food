import { describe, expect, it } from 'vitest';
import { publicOrderView, phonesMatch } from './orderPublic.js';

describe('publicOrderView', () => {
  it('strips PII from guest track response', () => {
    const view = publicOrderView({
      id: 'abc-123',
      status: 'pending',
      orderType: 'delivery',
      guestName: 'Jane Doe',
      guestEmail: 'jane@example.com',
      phone: '9876543210',
      address: '123 Secret Street',
      items: [{ food_name: 'Biryani', quantity: 2, lineTotal: 500 }],
      subtotal: 500,
      deliveryFee: 49,
      total: 549,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      statusHistory: [],
      createdAt: '2026-01-01',
    });

    expect(view.id).toBe('abc-123');
    expect(view.items).toHaveLength(1);
    expect(view.guestName).toBeUndefined();
    expect(view.address).toBeUndefined();
    expect(view.phone).toBeUndefined();
  });
});

describe('phonesMatch', () => {
  it('matches exact normalized numbers', () => {
    expect(phonesMatch('9876543210', '9876543210')).toBe(true);
    expect(phonesMatch('+91 98765 43210', '919876543210')).toBe(true);
  });

  it('matches 10-digit local to country-prefixed stored number', () => {
    expect(phonesMatch('9876543210', '919876543210')).toBe(true);
  });

  it('rejects partial suffix-only guesses', () => {
    expect(phonesMatch('543210', '9876543210')).toBe(false);
  });
});
