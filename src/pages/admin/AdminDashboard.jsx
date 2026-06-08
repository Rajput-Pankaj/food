import { Link } from 'react-router-dom';
import {
  MdReceiptLong,
  MdPeople,
  MdCurrencyRupee,
  MdRestaurantMenu,
  MdStar,
  MdArticle,
  MdNotificationsActive,
} from 'react-icons/md';
import { useAdminStats } from '../../hooks/useAdminStats';
import { ORDER_STATUS_LABELS } from '../../constants/roles';

function StarRow({ rating }) {
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();
  const menuStats = stats.menuStats || { total: stats.menuCount || 0 };
  const blogStats = stats.blogStats || { published: stats.blogCount || 0 };
  const reviewStats = stats.reviewStats || { total: stats.reviewCount || 0, recent: [] };
  const customers = stats.customerCount || 0;

  if (loading) {
    return <div className="text-sm text-gray-500">Loading dashboard...</div>;
  }

  const cards = [
    {
      label: 'Pending Orders',
      value: stats.pendingCount || 0,
      icon: MdNotificationsActive,
      color: 'bg-amber-500',
      link: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: MdReceiptLong,
      color: 'bg-blue-500',
      link: '/admin/orders',
    },
    {
      label: 'Revenue',
      value: `Rs.${stats.revenue}/-`,
      icon: MdCurrencyRupee,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      label: 'Customers',
      value: customers,
      icon: MdPeople,
      color: 'bg-purple-500',
      link: '/admin/users',
    },
    {
      label: 'Menu Items',
      value: menuStats.total,
      icon: MdRestaurantMenu,
      color: 'bg-orange-500',
      link: '/admin/menu',
    },
    {
      label: 'Reviews',
      value: reviewStats.total,
      icon: MdStar,
      color: 'bg-amber-500',
      link: '/admin/reviews',
    },
    {
      label: 'Blog Posts',
      value: blogStats.published,
      icon: MdArticle,
      color: 'bg-teal-500',
      link: '/admin/blogs',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Monitor orders, menu, reviews, and restaurant activity
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card) => {
          const StatIcon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl shadow p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 order-2 sm:order-1">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{card.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-0.5 truncate">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${card.color} rounded-lg flex items-center justify-center text-white shrink-0 order-1 sm:order-2`}
                >
                  <StatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Orders by Status</h3>
          {Object.keys(stats.byStatus).length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600 truncate">
                    {ORDER_STATUS_LABELS[status] || status}
                  </span>
                  <span className="font-semibold bg-gray-100 px-2.5 py-1 rounded-full text-xs sm:text-sm shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-green-600 text-xs sm:text-sm font-medium hover:underline shrink-0"
            >
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent orders.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{order.userEmail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-green-600 text-sm">Rs.{order.total}/-</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Reviews</h3>
            <Link
              to="/admin/reviews"
              className="text-green-600 text-xs sm:text-sm font-medium hover:underline shrink-0"
            >
              Manage
            </Link>
          </div>
          {reviewStats.recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviewStats.recent.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800 text-sm truncate">{review.foodName}</p>
                    <StarRow rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {reviewStats.total > 0 && (
            <p className="text-xs text-gray-400 mt-4">
              Average rating: {reviewStats.averageRating} / 5
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Menu Snapshot</h3>
          <Link
            to="/admin/menu"
            className="text-green-600 text-xs sm:text-sm font-medium hover:underline shrink-0"
          >
            Manage menu
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-800">{menuStats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">{menuStats.available}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-600">{menuStats.hidden}</p>
            <p className="text-xs text-gray-500">Hidden</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{menuStats.custom}</p>
            <p className="text-xs text-gray-500">Custom</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Blog Snapshot</h3>
          <Link
            to="/admin/blogs"
            className="text-green-600 text-xs sm:text-sm font-medium hover:underline shrink-0"
          >
            Manage blogs
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-800">{blogStats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">{blogStats.published}</p>
            <p className="text-xs text-gray-500">Published</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{blogStats.drafts}</p>
            <p className="text-xs text-gray-500">Drafts</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{blogStats.custom}</p>
            <p className="text-xs text-gray-500">Custom</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
