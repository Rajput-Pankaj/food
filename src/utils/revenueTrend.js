const DAY_MS = 24 * 60 * 60 * 1000;

function isCountableOrder(order) {
  const status = order?.status;
  return status !== 'rejected' && status !== 'cancelled';
}

export function buildRevenueTrend(orders, days = 7) {
  const buckets = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    buckets.push({
      date: key,
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      shortLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: 0,
      orders: 0,
    });
  }

  const bucketMap = Object.fromEntries(buckets.map((b) => [b.date, b]));

  for (const order of orders) {
    if (!isCountableOrder(order)) continue;
    const key = String(order.createdAt || '').slice(0, 10);
    if (!bucketMap[key]) continue;
    bucketMap[key].revenue += Number(order.total) || 0;
    bucketMap[key].orders += 1;
  }

  return buckets;
}

export function calcAvgOrderValue(orders, revenue) {
  const countable = orders.filter(isCountableOrder);
  if (!countable.length) return 0;
  const total =
    revenue ??
    countable.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  return Math.round(total / countable.length);
}
