export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Order Placed',
  accepted: 'Order Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  shipped: 'Shipped',
  delivered: 'Delivered',
  rejected: 'Rejected',
  // legacy aliases
  confirmed: 'Order Accepted',
  out_for_delivery: 'Shipped',
  ready_for_pickup: 'Ready',
  cancelled: 'Rejected',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-violet-100 text-violet-800 border-violet-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ready_for_pickup: 'bg-violet-100 text-violet-800 border-violet-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const LEGACY_STATUS_MAP = {
  confirmed: ORDER_STATUS.ACCEPTED,
  out_for_delivery: ORDER_STATUS.SHIPPED,
  ready_for_pickup: ORDER_STATUS.READY,
  cancelled: ORDER_STATUS.REJECTED,
};

export function normalizeOrderStatus(status) {
  return LEGACY_STATUS_MAP[status] || status;
}

export function isTerminalStatus(status) {
  const normalized = normalizeOrderStatus(status);
  return normalized === ORDER_STATUS.DELIVERED || normalized === ORDER_STATUS.REJECTED;
}

export function isActiveOrderStatus(status) {
  const normalized = normalizeOrderStatus(status);
  return !isTerminalStatus(normalized) && normalized !== ORDER_STATUS.PENDING;
}

export function isPendingOrderStatus(status) {
  return normalizeOrderStatus(status) === ORDER_STATUS.PENDING;
}

export function getTrackingFlow(orderType = 'delivery') {
  if (orderType === 'takeaway') {
    return [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.DELIVERED,
    ];
  }

  return [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
  ];
}

export const TRACKING_STEP_META = {
  pending: {
    label: 'Order Placed',
    description: 'Waiting for restaurant to accept your order',
    icon: 'placed',
  },
  accepted: {
    label: 'Accepted',
    description: 'Restaurant has accepted your order',
    icon: 'accepted',
  },
  preparing: {
    label: 'Preparing',
    description: 'Your food is being prepared',
    icon: 'preparing',
  },
  ready: {
    label: 'Ready',
    description: 'Order is packed and ready',
    icon: 'ready',
  },
  shipped: {
    label: 'Shipped',
    description: 'Rider is on the way to you',
    icon: 'shipped',
  },
  delivered: {
    label: 'Delivered',
    description: 'Order completed successfully',
    icon: 'delivered',
  },
  rejected: {
    label: 'Rejected',
    description: 'This order was rejected by the restaurant',
    icon: 'rejected',
  },
};

export function getTrackingStepLabel(step, orderType = 'delivery') {
  if (step === ORDER_STATUS.READY && orderType === 'takeaway') {
    return 'Ready for Pickup';
  }
  if (step === ORDER_STATUS.DELIVERED && orderType === 'takeaway') {
    return 'Picked Up';
  }
  if (step === ORDER_STATUS.SHIPPED && orderType === 'delivery') {
    return 'Out for Delivery';
  }
  return TRACKING_STEP_META[step]?.label || ORDER_STATUS_LABELS[step] || step;
}

export function getTrackingStepDescription(step, orderType = 'delivery') {
  if (step === ORDER_STATUS.READY && orderType === 'takeaway') {
    return 'Your order is ready — visit the store to collect it';
  }
  if (step === ORDER_STATUS.DELIVERED && orderType === 'takeaway') {
    return 'Order picked up successfully';
  }
  return TRACKING_STEP_META[step]?.description || '';
}

export function getNextStatus(order) {
  const status = normalizeOrderStatus(order.status);
  const flow = getTrackingFlow(order.orderType);
  const index = flow.indexOf(status);
  if (index === -1 || index >= flow.length - 1) return null;
  return flow[index + 1];
}

export function getNextStatusLabel(order) {
  const next = getNextStatus(order);
  if (!next) return null;
  return getTrackingStepLabel(next, order.orderType);
}

export const ADMIN_ORDER_TABS = [
  { id: 'pending', label: 'Pending', filter: (order) => isPendingOrderStatus(order.status) },
  {
    id: 'active',
    label: 'Active',
    filter: (order) => isActiveOrderStatus(order.status),
  },
  {
    id: 'completed',
    label: 'Completed',
    filter: (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.DELIVERED,
  },
  {
    id: 'rejected',
    label: 'Rejected',
    filter: (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.REJECTED,
  },
];
