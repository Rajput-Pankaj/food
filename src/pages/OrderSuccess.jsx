import { Link, useLocation, Navigate } from 'react-router-dom';
import { LuMapPin, LuStore } from 'react-icons/lu';
import PageLayout from '../components/PageLayout';
import { PAYMENT_METHOD_LABELS } from '../constants/roles';
import { PAYMENT_STATUS_LABELS } from '../constants/storeSettings';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getOrderById } from '../utils/orderStorage';

export default function OrderSuccess() {
  useDocumentTitle('Order Confirmed');
  const location = useLocation();
  const orderId = location.state?.orderId;
  const order = orderId ? getOrderById(orderId) : null;

  const total = location.state?.total ?? order?.total;
  const orderType = location.state?.orderType ?? order?.orderType ?? 'delivery';
  const paymentMethod = location.state?.paymentMethod ?? order?.paymentMethod;
  const paymentStatus = location.state?.paymentStatus ?? order?.paymentStatus;

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageLayout mainClassName="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-lg w-full">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-4">
          Your order has been placed and is waiting for the restaurant to accept it.
          You can track every step live from your dashboard.
        </p>

        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-left text-sm space-y-2 mb-5">
          <p>
            <span className="text-gray-500">Order ID:</span>{' '}
            <span className="font-semibold text-gray-800">
              {orderId.slice(0, 8).toUpperCase()}
            </span>
          </p>
          {total && (
            <p>
              <span className="text-gray-500">Total:</span>{' '}
              <span className="font-bold text-green-600">Rs.{total}/-</span>
            </p>
          )}
          <p className="inline-flex items-center gap-1.5 text-gray-700">
            {orderType === 'takeaway' ? (
              <LuStore className="w-4 h-4 text-green-600" />
            ) : (
              <LuMapPin className="w-4 h-4 text-green-600" />
            )}
            {orderType === 'takeaway' ? 'Takeaway / Pickup' : 'Home Delivery'}
          </p>
          {paymentMethod && (
            <p>
              <span className="text-gray-500">Payment:</span>{' '}
              {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
              {paymentStatus && (
                <span className="text-gray-500">
                  {' '}
                  · {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/track-order/${orderId}`}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Track Order Live
          </Link>
          <Link
            to="/menu"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Order More
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
