import { useMemo, useState } from 'react';
import { MdDelete, MdSearch, MdStar } from 'react-icons/md';
import { getPublicUsers } from '../../utils/authStorage';
import {
  deleteReview,
  getReviewStats,
  getReviewsForAdmin,
} from '../../utils/customerStorage';

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <MdStar
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState(() => getReviewsForAdmin(getPublicUsers()));
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const stats = getReviewStats();

  const refresh = () => setReviews(getReviewsForAdmin(getPublicUsers()));

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.foodName.toLowerCase().includes(search.toLowerCase()) ||
        review.userName.toLowerCase().includes(search.toLowerCase()) ||
        review.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        (review.comment || '').toLowerCase().includes(search.toLowerCase());
      const matchesRating =
        ratingFilter === 'all' || String(review.rating) === ratingFilter;
      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const handleDelete = (reviewId) => {
    if (!window.confirm('Remove this customer review?')) return;
    deleteReview(reviewId);
    refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Reviews</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-0.5">
          View and moderate customer food reviews
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Total Reviews</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 flex items-center gap-1">
            {stats.averageRating || '—'}
            {stats.total > 0 && <MdStar className="w-5 h-5 text-yellow-400" />}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 col-span-2">
          <p className="text-xs text-gray-500 mb-2">Rating Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <span
                key={rating}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {rating}★ {stats.byRating[rating] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-3 sm:p-4 space-y-3">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by food, customer, or comment..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
          aria-label="Filter by rating"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={String(rating)}>
              {rating} Star{rating > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 sm:p-10 text-center">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-gray-500 text-sm sm:text-base">
            {stats.total === 0 ? 'No customer reviews yet.' : 'No reviews match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredReviews.map((review) => (
            <article key={review.id} className="bg-white rounded-xl shadow p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{review.foodName}</h3>
                    <StarDisplay rating={review.rating} />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    by {review.userName} · {review.userEmail}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Order #{review.orderId.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-3 break-words">{review.comment}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(review.id)}
                  className="inline-flex items-center gap-1.5 self-start px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 shrink-0"
                >
                  <MdDelete className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
