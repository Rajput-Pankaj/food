import { Link, Navigate, useParams } from 'react-router-dom';
import { LuArrowLeft, LuMapPin, LuStore } from 'react-icons/lu';
import PageLayout from '../../components/PageLayout';
import OrderTimeline from '../../components/orders/OrderTimeline';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../hooks/useOrders';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getTrackingStepDescription,
  getTrackingStepLabel,
  isActiveOrderStatus,
  isPendingOrderStatus,
  isTerminalStatus,
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../../constants/orders';
import { PAYMENT_METHOD_LABELS } from '../../constants/roles';
import { PAYMENT_STATUS_LABELS } from '../../constants/storeSettings';

export default function OrderTracking() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { order } = useOrder(orderId);

  useDocumentTitle(order ? `Track Order #${order.id.slice(0, 8)}` : 'Track Order');

  if (!order) {
    return (
      <PageLayout mainClassName="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Order not found.</p>
        <Link to="/dashboard?tab=orders" className="text-green-600 font-semibold hover:underline">
          Back to orders
        </Link>
      </PageLayout>
    );
  }

  if (order.userId !== user?.id) {
    return <Navigate to="/dashboard" replace />;
  }

  const status = normalizeOrderStatus(order.status);
  const isRejected = status === ORDER_STATUS.REJECTED;
  const isDelivered = status === ORDER_STATUS.DELIVERED;
  const isPending = isPendingOrderStatus(order.status);
  const isActive = isActiveOrderStatus(order.status);

  const statusBanner = isRejected
    ? 'bg-red-50 border-red-200 text-red-900'
    : isDelivered
      ? 'bg-green-50 border-green-200 text-green-900'
      : isPending
        ? 'bg-amber-50 border-amber-200 text-amber-900'
        : 'bg-blue-50 border-blue-200 text-blue-900';

  return (
    <PageLayout mainClassName="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <Link
        to="/dashboard?tab=orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-600 mb-5"
      >
        <LuArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Track Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} orderType={order.orderType} />
      </div>

      <div className={`rounded-2xl border p-4 sm:p-5 mb-6 ${statusBanner}`}>
        <p className="font-bold text-base sm:text-lg">
          {getTrackingStepLabel(status, order.orderType)}
        </p>
        <p className="text-sm mt-1 opacity-90">
          {getTrackingStepDescription(status, order.orderType)}
        </p>
        {isPending && (
          <p className="text-xs mt-2 font-medium">
            Waiting for the restaurant to accept your order...
          </p>
        )}
        {isActive && (
          <p className="text-xs mt-2 font-medium animate-pulse">
            Live tracking — this page updates automatically
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Order progress</h2>
        <OrderTimeline order={order} variant="vertical" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Order summary</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.food_name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">Rs.{item.price * item.quantity}/-</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-green-600">Rs.{order.total}/-</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3 text-sm">
          <h3 className="text-sm font-bold text-gray-800">Details</h3>
          <p className="inline-flex items-start gap-2 text-gray-600">
            {order.orderType === 'takeaway' ? (
              <LuStore className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <LuMapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            )}
            <span>
              <strong className="text-gray-800 block">
                {order.orderType === 'takeaway' ? 'Pickup at' : 'Deliver to'}
              </strong>
              {order.address}
            </span>
          </p>
          <p>
            <strong className="text-gray-800">Phone:</strong> {order.phone}
          </p>
          <p>
            <strong className="text-gray-800">Payment:</strong>{' '}
            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            {order.paymentStatus && (
              <span className="text-gray-500">
                {' '}
                · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
            )}
          </p>
          {order.notes && (
            <p>
              <strong className="text-gray-800">Notes:</strong> {order.notes}
            </p>
          )}
        </div>
      </div>

      {!isTerminalStatus(order.status) && (
        <div className="text-center text-xs text-gray-400">
          Status updates appear here in real time when the restaurant changes your order.
        </div>
      )}
    </PageLayout>
  );
}
