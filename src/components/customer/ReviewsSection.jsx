import { useEffect, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import StarRating from './StarRating';
import { USE_API } from '../../config/api';
import {
  deleteReview,
  fetchReviewsByUser,
  getReviewsByUser,
} from '../../utils/customerStorage';

export default function ReviewsSection({ userId }) {
  const [reviews, setReviews] = useState(() =>
    USE_API ? [] : getReviewsByUser(userId)
  );
  const [loading, setLoading] = useState(USE_API);

  const refresh = async () => {
    if (USE_API) {
      const data = await fetchReviewsByUser();
      setReviews(data);
      setLoading(false);
      return;
    }
    setReviews(getReviewsByUser(userId));
    setLoading(false);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    const handleUpdate = () => {
      refresh().catch(() => setLoading(false));
    };
    window.addEventListener('customer-reviews-updated', handleUpdate);
    return () => window.removeEventListener('customer-reviews-updated', handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(reviewId);
    await refresh();
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
        <p className="text-4xl mb-3">⭐</p>
        <p className="text-gray-500 text-sm sm:text-base mb-1">No reviews yet.</p>
        <p className="text-gray-400 text-xs sm:text-sm">
          Review dishes from your delivered orders in the Orders tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">My Reviews</h2>
        <p className="text-sm text-gray-500 mt-0.5">{reviews.length} review(s) written</p>
      </div>

      {reviews.map((review) => (
        <article key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800">{review.foodName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Order #{review.orderId.slice(0, 8).toUpperCase()} ·{' '}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <StarRating value={review.rating} readOnly size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 break-words">{review.comment}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(review.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
              aria-label="Delete review"
            >
              <MdDelete className="w-4 h-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
