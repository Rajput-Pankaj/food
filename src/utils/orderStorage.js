import { ORDER_STATUS, getNextStatus, normalizeOrderStatus } from '../constants/orders';
import { ordersApi } from '../api';
import { USE_API } from '../config/api';
import { getJson, setJson, storageKeys } from './storage';

function dispatchOrdersUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('orders-updated'));
  }
}

function persistOrders(orders) {
  setJson(storageKeys.ORDERS_KEY, orders);
  dispatchOrdersUpdated();
}

function withStatusHistory(order, status, note = '') {
  const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
  history.push({
    status,
    at: new Date().toISOString(),
    note,
  });

  return {
    ...order,
    status,
    statusHistory: history,
    updatedAt: new Date().toISOString(),
  };
}

export function getAllOrders() {
  if (USE_API) return [];
  return getJson(storageKeys.ORDERS_KEY, []);
}

export function getOrdersByUser(userId) {
  return getAllOrders().filter((order) => order.userId === userId);
}

export function getOrderById(orderId) {
  return getAllOrders().find((order) => order.id === orderId) || null;
}

export async function saveOrder(order) {
  if (USE_API) {
    const saved = await ordersApi.create(order);
    dispatchOrdersUpdated();
    return saved;
  }

  const orders = getAllOrders();
  const initialStatus = order.status || ORDER_STATUS.PENDING;
  const enriched = withStatusHistory(
    { ...order, status: initialStatus },
    initialStatus,
    'Order placed'
  );
  persistOrders([enriched, ...orders]);
  return enriched;
}

export function updateOrder(orderId, updates) {
  let updated = null;
  const orders = getAllOrders().map((order) => {
    if (order.id !== orderId) return order;
    updated = { ...order, ...updates, updatedAt: new Date().toISOString() };
    return updated;
  });
  persistOrders(orders);
  return updated;
}

export async function updateOrderStatus(orderId, status, note = '') {
  if (USE_API) {
    const updated = await ordersApi.setStatus(orderId, status, note);
    dispatchOrdersUpdated();
    return updated;
  }

  let updated = null;
  const orders = getAllOrders().map((order) => {
    if (order.id !== orderId) return order;
    updated = withStatusHistory(order, status, note);
    return updated;
  });
  persistOrders(orders);
  return updated;
}

export async function acceptOrder(orderId, note = 'Order accepted by restaurant') {
  if (USE_API) {
    const updated = await ordersApi.accept(orderId, note);
    dispatchOrdersUpdated();
    return updated;
  }
  return updateOrderStatus(orderId, ORDER_STATUS.ACCEPTED, note);
}

export async function rejectOrder(orderId, note = 'Order rejected by restaurant') {
  if (USE_API) {
    const updated = await ordersApi.reject(orderId, note);
    dispatchOrdersUpdated();
    return updated;
  }
  return updateOrderStatus(orderId, ORDER_STATUS.REJECTED, note);
}

export async function advanceOrderStatus(orderId, note = '') {
  if (USE_API) {
    const updated = await ordersApi.advance(orderId, note);
    dispatchOrdersUpdated();
    return updated;
  }

  const order = getOrderById(orderId);
  if (!order) return null;
  const next = getNextStatus(order);
  if (!next) return order;
  return updateOrderStatus(orderId, next, note || `Marked as ${next}`);
}

export function getOrderStats() {
  const orders = getAllOrders();
  const revenue = orders
    .filter((order) => normalizeOrderStatus(order.status) !== ORDER_STATUS.REJECTED)
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const byStatus = orders.reduce((acc, order) => {
    const key = normalizeOrderStatus(order.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const pendingCount = orders.filter(
    (order) => normalizeOrderStatus(order.status) === ORDER_STATUS.PENDING
  ).length;

  return {
    totalOrders: orders.length,
    revenue,
    byStatus,
    pendingCount,
    recentOrders: orders.slice(0, 5),
  };
}
