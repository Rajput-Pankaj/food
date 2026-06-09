import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LuArrowLeft, LuMapPin, LuStore } from 'react-icons/lu';
import PageLayout from '../../components/PageLayout';
import OrderTimeline from '../../components/orders/OrderTimeline';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { ordersApi } from '../../api';
import { USE_API } from '../../config/api';
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
import { getOrderById } from '../../utils/orderStorage';

const POLL_INTERVAL_MS = 15_000;

function isPollingStatus(status) {
  return !isTerminalStatus(status);
}

function GuestTrackForm({ initialPhone, initialEmail, onSubmit, loading, error }) {
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ phone: phone.trim(), email: email.trim() });
  };

  return (
    <PageLayout mainClassName="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter the phone number or email used when placing the order.
      </p>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <label htmlFor="track-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number
          </label>
          <input
            id="track-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98765 43210"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label htmlFor="track-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
          />
        </div>
        <p className="text-xs text-gray-400">Provide at least one of phone or email.</p>
        <button
          type="submit"
          disabled={loading || (!phone.trim() && !email.trim())}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? 'Looking up order...' : 'Track Order'}
        </button>
      </form>
    </PageLayout>
  );
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const phoneParam = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';

  const isGuest = !isAuthenticated;
  const { order: authOrder, loading: authLoading } = useOrder(isGuest ? null : orderId);

  const [guestOrder, setGuestOrder] = useState(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [guestCredentials, setGuestCredentials] = useState(() =>
    phoneParam || emailParam ? { phone: phoneParam, email: emailParam } : null
  );

  const fetchGuestOrder = useCallback(
    async (credentials) => {
      if (!USE_API) {
        const localOrder = getOrderById(orderId);
        if (!localOrder) {
          setGuestError('Order not found.');
          setGuestOrder(null);
          return null;
        }
        setGuestOrder(localOrder);
        setGuestError('');
        return localOrder;
      }

      setGuestLoading(true);
      setGuestError('');
      try {
        const data = await ordersApi.track({
          orderId,
          phone: credentials.phone || undefined,
          email: credentials.email || undefined,
        });
        setGuestOrder(data);
        return data;
      } catch (err) {
        setGuestError(err.message || 'Could not find order.');
        setGuestOrder(null);
        return null;
      } finally {
        setGuestLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (!isGuest || !guestCredentials) return undefined;

    let cancelled = false;
    let pollTimer = null;

    const run = async () => {
      const data = await fetchGuestOrder(guestCredentials);
      if (cancelled || !data) return;

      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (USE_API && isPollingStatus(data.status)) {
        pollTimer = setInterval(() => fetchGuestOrder(guestCredentials), POLL_INTERVAL_MS);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isGuest, guestCredentials, fetchGuestOrder]);

  const handleGuestSubmit = (credentials) => {
    setGuestCredentials(credentials);
  };

  const order = isGuest ? guestOrder : authOrder;
  const loading = isGuest ? guestLoading && !guestOrder : authLoading;

  useDocumentTitle(order ? `Track Order #${order.id.slice(0, 8)}` : 'Track Order');

  if (isGuest && !guestCredentials) {
    return (
      <GuestTrackForm
        initialPhone={phoneParam}
        initialEmail={emailParam}
        onSubmit={handleGuestSubmit}
        loading={guestLoading}
        error={guestError}
      />
    );
  }

  if (loading && !order) {
    return (
      <PageLayout mainClassName="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading order...</p>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout mainClassName="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">{guestError || 'Order not found.'}</p>
        {isGuest ? (
          <button
            type="button"
            onClick={() => {
              setGuestCredentials(null);
              setGuestError('');
            }}
            className="text-green-600 font-semibold hover:underline"
          >
            Try again
          </button>
        ) : (
          <Link to="/dashboard?tab=orders" className="text-green-600 font-semibold hover:underline">
            Back to orders
          </Link>
        )}
      </PageLayout>
    );
  }

  if (!isGuest && order.userId && order.userId !== user?.id) {
    return (
      <PageLayout mainClassName="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">You do not have access to this order.</p>
        <Link to="/dashboard" className="text-green-600 font-semibold hover:underline">
          Back to dashboard
        </Link>
      </PageLayout>
    );
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

  const backLink = isGuest ? (
    <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-600 mb-5">
      <LuArrowLeft className="w-4 h-4" />
      Back to home
    </Link>
  ) : (
    <Link
      to="/dashboard?tab=orders"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-600 mb-5"
    >
      <LuArrowLeft className="w-4 h-4" />
      Back to orders
    </Link>
  );

  return (
    <PageLayout mainClassName="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {backLink}

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
