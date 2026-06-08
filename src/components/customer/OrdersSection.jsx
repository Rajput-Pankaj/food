import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdReplay } from 'react-icons/md';
import { LuArrowRight, LuMapPin } from 'react-icons/lu';
import StarRating from './StarRating';
import OrderTimeline from '../orders/OrderTimeline';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { useCart } from '../../context/CartContext';
import { USE_API } from '../../config/api';
import {
  fetchReviewsByUser,
  getReviewsByUser,
  saveReview,
} from '../../utils/customerStorage';
import { PAYMENT_METHOD_LABELS } from '../../constants/roles';
import { PAYMENT_STATUS_LABELS } from '../../constants/storeSettings';
import { isActiveOrderStatus, isPendingOrderStatus } from '../../constants/orders';

function ReviewForm({ userId, orderId, item, existing, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (existing && !isOpen) {
    return (
      <div className="mt-2 pl-2 border-l-2 border-yellow-200">
        <StarRating value={existing.rating} readOnly size="sm" />
        {existing.comment && (
          <p className="text-xs text-gray-500 mt-1 break-words">{existing.comment}</p>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-green-600 hover:text-green-700 mt-1 font-medium"
        >
          Edit review
        </button>
      </div>
    );
  }

  if (!isOpen && !existing) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-green-600 hover:text-green-700 font-medium mt-1"
      >
        Write a review
      </button>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating < 1) return;

    await saveReview({
      userId,
      orderId,
      foodId: item.id,
      foodName: item.food_name,
      rating,
      comment: comment.trim(),
    });
    setMessage(existing ? 'Review updated.' : 'Review saved. Thank you!');
    setIsOpen(false);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
      <StarRating value={rating} onChange={setRating} size="sm" />
      <textarea
        rows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share your experience (optional)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
      />
      {message && <p className="text-xs text-green-600">{message}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={rating < 1}
          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {existing ? 'Update' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            if (existing) {
              setRating(existing.rating);
              setComment(existing.comment || '');
            }
          }}
          className="text-xs text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function OrdersSection({ userId, orders }) {
  const navigate = useNavigate();
  const { addItemsToCart, setIsCartOpen } = useCart();
  const [reviewKey, setReviewKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [reviews, setReviews] = useState(() =>
    USE_API ? [] : getReviewsByUser(userId)
  );

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        setReviews(await fetchReviewsByUser());
        return;
      }
      setReviews(getReviewsByUser(userId));
    };

    refresh();
    window.addEventListener('customer-reviews-updated', refresh);
    return () => window.removeEventListener('customer-reviews-updated', refresh);
  }, [userId]);

  const findReview = (orderId, foodId) =>
    reviews.find(
      (review) =>
        review.userId === userId && review.orderId === orderId && review.foodId === foodId
    );

  const handleRepeatOrder = (order) => {
    if (order.status === 'rejected' || order.status === 'cancelled') return;
    addItemsToCart(order.items);
    setIsCartOpen(true);
    navigate('/menu');
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="text-gray-500 mb-4 text-sm sm:text-base">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          to="/menu"
          className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700"
        >
          Browse our menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Order History</h2>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} order(s)</p>
        </div>
        <Link
          to="/menu"
          className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 text-center transition-colors shrink-0"
        >
          Order Food
        </Link>
      </div>

      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const showTracking =
          isPendingOrderStatus(order.status) ||
          isActiveOrderStatus(order.status);
        const isDelivered = order.status === 'delivered';

        return (
          <article
            key={order.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-gray-800 text-sm sm:text-base">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <OrderStatusBadge status={order.status} orderType={order.orderType} />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <p className="font-bold text-green-600 text-base sm:text-lg">
                    Rs.{order.total}/-
                  </p>
                  {order.status !== 'rejected' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleRepeatOrder(order)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <MdReplay className="w-3.5 h-3.5" />
                      Repeat
                    </button>
                  )}
                </div>
              </div>

              {showTracking && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <OrderTimeline order={order} variant="horizontal" />
                  <Link
                    to={`/track-order/${order.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700"
                  >
                    Full tracking details
                    <LuArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="mt-3 text-sm font-semibold text-gray-500 hover:text-green-600"
              >
                {isExpanded ? 'Hide items' : 'Show items'}
              </button>

              {isExpanded && (
                <ul className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <div className="flex justify-between gap-2">
                        <span className="truncate">
                          {item.food_name} × {item.quantity}
                        </span>
                        <span className="shrink-0 text-gray-500">
                          Rs.{item.price * item.quantity}/-
                        </span>
                      </div>
                      {isDelivered && (
                        <ReviewForm
                          key={`${item.id}-${reviewKey}`}
                          userId={userId}
                          orderId={order.id}
                          item={item}
                          existing={findReview(order.id, item.id)}
                          onSaved={() => setReviewKey((key) => key + 1)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500 space-y-1">
                <p className="break-words inline-flex items-start gap-1.5">
                  <LuMapPin className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-gray-600">
                      {order.orderType === 'takeaway' ? 'Pickup at:' : 'Deliver to:'}
                    </strong>{' '}
                    {order.address}
                  </span>
                </p>
                {order.paymentMethod && (
                  <p>
                    <strong className="text-gray-600">Payment:</strong>{' '}
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    {order.paymentStatus && (
                      <span className="text-gray-400">
                        {' '}
                        · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
