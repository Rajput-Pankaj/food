/** Fields safe to return from guest order tracking (no PII beyond status). */
export function publicOrderView(order) {
  return {
    id: order.id,
    status: order.status,
    orderType: order.orderType,
    items: (order.items || []).map((item) => ({
      food_name: item.food_name,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function phonesMatch(input, stored) {
  const a = String(input || '').replace(/\D/g, '');
  const b = String(stored || '').replace(/\D/g, '');
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length === 10 && b.length > 10 && b.endsWith(a)) return true;
  if (b.length === 10 && a.length > 10 && a.endsWith(b)) return true;
  return false;
}
