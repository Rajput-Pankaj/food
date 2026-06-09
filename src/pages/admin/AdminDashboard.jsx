import { Link } from 'react-router-dom';
import { MdReceiptLong, MdCurrencyRupee, MdNotificationsActive, MdTrendingUp } from 'react-icons/md';
import { RevenueBarChart, StatusBarChart, StatusDonut } from '../../components/admin/DashboardCharts';
import { ORDER_STATUS_LABELS } from '../../constants/roles';
import { useAdminStats } from '../../hooks/useAdminStats';
import { formatINR, formatINRCompact, formatINRFull } from '../../utils/currency';

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const revenue = stats.revenue || 0;
  const trend = stats.revenueTrend || [];
  const weekRevenue = trend.reduce((sum, day) => sum + day.revenue, 0);
  const weekOrders = trend.reduce((sum, day) => sum + day.orders, 0);

  const cards = [
    {
      label: 'Pending Orders',
      value: stats.pendingCount || 0,
      sub: 'Awaiting confirmation',
      icon: MdNotificationsActive,
      accent: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      link: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      sub: `${weekOrders} this week`,
      icon: MdReceiptLong,
      accent: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      link: '/admin/orders',
    },
    {
      label: 'Total Revenue',
      value: formatINRCompact(revenue),
      fullValue: formatINRFull(revenue),
      sub: stats.avgOrderValue
        ? `Avg. ${formatINRCompact(stats.avgOrderValue)} / order`
        : 'No completed sales yet',
      icon: MdCurrencyRupee,
      accent: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      link: '/admin/orders',
      large: true,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Track orders, revenue, and daily performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const StatIcon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className={`relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow ${
                card.large ? 'sm:col-span-1' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-bl-[3rem] opacity-80`} />
              <div className="relative">
                <div
                  className={`inline-flex w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} text-white items-center justify-center mb-4 shadow-sm`}
                >
                  <StatIcon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 tracking-tight"
                  title={card.fullValue || String(card.value)}
                >
                  {card.value}
                </p>
                {card.fullValue && card.fullValue !== card.value && (
                  <p className="text-xs text-gray-400 mt-0.5">{card.fullValue}</p>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  {card.label === 'Total Revenue' && <MdTrendingUp className="w-3.5 h-3.5 text-green-600" />}
                  {card.sub}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue — Last 7 Days</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Week total: <span className="font-semibold text-green-600">{formatINRFull(weekRevenue)}</span>
              </p>
            </div>
          </div>
          <RevenueBarChart data={trend} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <StatusDonut byStatus={stats.byStatus} total={stats.totalOrders} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <StatusBarChart byStatus={stats.byStatus} labels={ORDER_STATUS_LABELS} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-green-600 text-xs sm:text-sm font-semibold hover:underline shrink-0"
            >
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{order.userEmail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-green-600 text-sm">{formatINR(order.total)}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
