import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, normalizeOrderStatus } from '../../constants/orders';

export default function OrderStatusBadge({ status, orderType, className = '' }) {
  const normalized = normalizeOrderStatus(status);
  const label = ORDER_STATUS_LABELS[normalized] || ORDER_STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
        ORDER_STATUS_COLORS[normalized] || ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      } ${className}`}
    >
      {orderType === 'takeaway' && normalized === 'ready' ? 'Ready for Pickup' : label}
    </span>
  );
}
