export const DEFAULT_STORE_SETTINGS = {
  storeName: 'FoodExpress',
  storeAddress: '123 Food Street, Connaught Place, New Delhi - 110001',
  storePhone: '+91 8429168953',
  deliveryFee: 49,
  freeDeliveryThreshold: 500,
  deliveryEnabled: true,
  takeawayEnabled: true,
  enabledPaymentMethods: ['cod', 'upi', 'razorpay'],
  upi: {
    vpa: '',
    payeeName: 'FoodExpress',
  },
  razorpay: {
    keyId: '',
    enabled: false,
  },
  updatedAt: null,
};

export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay with cash when your order arrives',
    icon: 'cash',
  },
  upi: {
    id: 'upi',
    label: 'UPI QR Pay',
    description: 'Scan QR & pay exact order amount via any UPI app',
    icon: 'upi',
  },
  razorpay: {
    id: 'razorpay',
    label: 'Razorpay',
    description: 'Cards, UPI, wallets & netbanking via Razorpay',
    icon: 'razorpay',
  },
};

export const ORDER_TYPES = {
  delivery: {
    id: 'delivery',
    label: 'Delivery',
    description: 'Get food delivered to your doorstep',
  },
  takeaway: {
    id: 'takeaway',
    label: 'Takeaway',
    description: 'Pick up your order from our store',
  },
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
};
