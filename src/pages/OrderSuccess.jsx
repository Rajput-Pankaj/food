import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { LuMapPin, LuStore } from 'react-icons/lu';
import PageLayout from '../components/PageLayout';
import { ordersApi } from '../api';
import { USE_API } from '../config/api';
import { PAYMENT_METHOD_LABELS } from '../constants/roles';
import { PAYMENT_STATUS_LABELS } from '../constants/storeSettings';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getOrderById } from '../utils/orderStorage';

export default function OrderSuccess() {
  useDocumentTitle('Order Confirmed');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const orderId = location.state?.orderId || searchParams.get('orderId');
  const [apiOrder, setApiOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!USE_API || !orderId) return;

    if (isAuthenticated) {
      ordersApi.get(orderId).then(setApiOrder).catch(() => setApiOrder(null));
      return;
    }

    const phone = location.state?.phone || searchParams.get('phone') || '';
    const email = location.state?.guestEmail || searchParams.get('email') || '';
    if (!phone && !email) return;

    setLoading(true);
    ordersApi
      .track({ orderId, phone: phone || undefined, email: email || undefined })
      .then(setApiOrder)
      .catch(() => setApiOrder(null))
      .finally(() => setLoading(false));
  }, [orderId, isAuthenticated, location.state, searchParams]);

  const localOrder = orderId ? getOrderById(orderId) : null;
  const order = USE_API ? apiOrder || localOrder : localOrder;

  const total = order?.total ?? location.state?.total;
  const orderType = order?.orderType ?? location.state?.orderType ?? 'delivery';
  const paymentMethod = order?.paymentMethod ?? location.state?.paymentMethod;
  const paymentStatus = order?.paymentStatus ?? location.state?.paymentStatus;
  const phone = order?.phone || location.state?.phone || searchParams.get('phone') || '';

  const trackLink = useMemo(() => {
    const base = `/track-order/${orderId}`;
    if (!phone) return base;
    const params = new URLSearchParams({ phone });
    const email = location.state?.guestEmail || searchParams.get('email');
    if (email) params.set('email', email);
    return `${base}?${params}`;
  }, [orderId, phone, location.state?.guestEmail, searchParams]);

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageLayout mainClassName="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 max-w-lg w-full">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your order has been placed and is waiting for the restaurant to accept it.
          You can track every step live from your dashboard.
        </p>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Loading order details...</p>
        )}

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 text-left text-sm space-y-2 mb-5">
          <p>
            <span className="text-gray-500 dark:text-gray-400">Order ID:</span>{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {orderId.slice(0, 8).toUpperCase()}
            </span>
          </p>
          {total && (
            <p>
              <span className="text-gray-500 dark:text-gray-400">Total:</span>{' '}
              <span className="font-bold text-green-600">Rs.{total}/-</span>
            </p>
          )}
          <p className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
            {orderType === 'takeaway' ? (
              <LuStore className="w-4 h-4 text-green-600" />
            ) : (
              <LuMapPin className="w-4 h-4 text-green-600" />
            )}
            {orderType === 'takeaway' ? 'Takeaway / Pickup' : 'Home Delivery'}
          </p>
          {paymentMethod && (
            <p>
              <span className="text-gray-500 dark:text-gray-400">Payment:</span>{' '}
              {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
              {paymentStatus && (
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}
                  · {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={trackLink}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Track Order Live
          </Link>
          <Link
            to="/menu"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
          >
            Order More
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
