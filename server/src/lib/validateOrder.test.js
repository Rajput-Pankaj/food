import { describe, expect, it, vi } from 'vitest';
import { validateAndBuildOrder } from './validateOrder.js';

const settings = {
  deliveryEnabled: true,
  takeawayEnabled: true,
  deliveryFee: 49,
  freeDeliveryThreshold: 500,
  storeAddress: '123 Test St',
  enabledPaymentMethods: ['cod', 'upi', 'razorpay'],
};

function mockQuery(menuItems) {
  return vi.fn(async (sql, params) => {
    if (sql.includes('menu_items')) {
      return { rows: menuItems.map((payload) => ({ id: payload.id, payload })) };
    }
    if (sql.includes('store_settings')) {
      return { rows: [{ payload: settings }] };
    }
    return { rows: [] };
  });
}

describe('validateAndBuildOrder', () => {
  const user = { id: 'user-1', email: 'test@example.com' };

  it('rejects tampered totals', async () => {
    const query = mockQuery([
      { id: 1, food_name: 'Pizza', price: 499, available: true, food_category: 'Main', food_type: 'veg', food_image: '' },
    ]);

    const result = await validateAndBuildOrder(
      {
        id: 'order-1',
        items: [{ id: 1, quantity: 1, price: 1 }],
        subtotal: 1,
        deliveryFee: 0,
        total: 1,
        orderType: 'takeaway',
        phone: '9999999999',
        paymentMethod: 'cod',
      },
      user,
      query
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/totals/i);
  });

  it('accepts valid order with server-calculated totals', async () => {
    const query = mockQuery([
      { id: 1, food_name: 'Pizza', price: 200, available: true, food_category: 'Main', food_type: 'veg', food_image: '' },
    ]);

    const result = await validateAndBuildOrder(
      {
        id: 'order-2',
        items: [{ id: 1, quantity: 2, price: 200 }],
        subtotal: 400,
        deliveryFee: 49,
        total: 449,
        orderType: 'delivery',
        address: '42 Test Lane',
        phone: '9999999999',
        paymentMethod: 'cod',
      },
      user,
      query
    );

    expect(result.ok).toBe(true);
    expect(result.payload.subtotal).toBe(400);
    expect(result.payload.total).toBe(449);
    expect(result.payload.items[0].quantity).toBe(2);
  });
});
