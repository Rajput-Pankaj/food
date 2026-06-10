import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdReceiptLong, MdCurrencyRupee, MdNotificationsActive, MdTrendingUp } from 'react-icons/md';
import { RevenueBarChart, StatusBarChart, StatusDonut } from '../../components/admin/DashboardCharts';
import { ORDER_STATUS_LABELS } from '../../constants/roles';
import { useAdminStats } from '../../hooks/useAdminStats';
import { formatINR, formatINRCompact, formatINRFull } from '../../utils/currency';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: '7 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getPeriodRange(period, customFrom, customTo) {
  const now = new Date();
  switch (period) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return { from: startOfDay(new Date(now.getTime() - 6 * DAY_MS)), to: endOfDay(now) };
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case 'custom':
      if (customFrom && customTo) {
        const from = startOfDay(new Date(customFrom));
        const to = endOfDay(new Date(customTo));
        if (from <= to) return { from, to };
      }
      return null;
    default:
      return null;
  }
}

function formatRangeDate(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getPeriodLabel(period, range) {
  if (period === 'today') return 'Today';
  if (period === 'week') return 'Last 7 days';
  if (period === 'month') return 'This month';
  if (range) return `${formatRangeDate(range.from)} – ${formatRangeDate(range.to)}`;
  return 'All time';
}

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hourKey = (d) => `${dayKey(d)}T${pad(d.getHours())}`;

function buildTrendSeries(stats, range) {
  const rows = stats.revenueTrend || [];
  // localStorage fallback returns a pre-filled series with labels — use as-is
  if (!stats.trendBucket) return rows;

  const map = Object.fromEntries(rows.map((r) => [r.date, r]));
  const now = new Date();
  const from = range?.from ?? startOfDay(new Date(now.getTime() - 6 * DAY_MS));
  const to = range?.to ?? endOfDay(now);
  const series = [];

  if (stats.trendBucket === 'hour') {
    const cursor = new Date(from);
    cursor.setMinutes(0, 0, 0);
    for (let t = cursor.getTime(); t <= to.getTime(); t += 3600 * 1000) {
      const d = new Date(t);
      const key = hourKey(d);
      const label = d.toLocaleTimeString('en-IN', { hour: 'numeric' }).replace(' ', '');
      series.push({
        date: key,
        label,
        shortLabel: `${formatRangeDate(d)}, ${label}`,
        revenue: Number(map[key]?.revenue) || 0,
        orders: map[key]?.orders || 0,
      });
    }
    return series;
  }

  for (let t = startOfDay(from).getTime(); t <= to.getTime(); t += DAY_MS) {
    const d = new Date(t);
    const key = dayKey(d);
    series.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      shortLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      revenue: Number(map[key]?.revenue) || 0,
      orders: map[key]?.orders || 0,
    });
  }
  return series;
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const range = useMemo(
    () => getPeriodRange(period, customFrom, customTo),
    [period, customFrom, customTo]
  );
  const { stats, loading, fetching } = useAdminStats(range);

  const periodLabel = getPeriodLabel(period, range);
  const trendSeries = useMemo(() => buildTrendSeries(stats, range), [stats, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const revenue = stats.revenue || 0;
  const periodOrders = stats.totalOrders || 0;
  const trendRevenue = trendSeries.reduce((sum, point) => sum + point.revenue, 0);

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
      label: 'Orders',
      value: periodOrders,
      sub: periodLabel,
      icon: MdReceiptLong,
      accent: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      link: '/admin/orders',
    },
    {
      label: 'Revenue',
      value: formatINRCompact(revenue),
      fullValue: formatINRFull(revenue),
      sub: stats.avgOrderValue
        ? `${periodLabel} · Avg. ${formatINRCompact(stats.avgOrderValue)} / order`
        : `${periodLabel} · No completed sales`,
      icon: MdCurrencyRupee,
      accent: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      link: '/admin/orders',
      large: true,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Showing data for <span className="font-semibold text-gray-700">{periodLabel}</span>
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
          {/* Mobile: compact dropdown */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="sm:hidden w-full max-w-[10rem] self-end border border-gray-200 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            aria-label="Time period"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Desktop: pill buttons */}
          <div className="hidden sm:inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  period === p.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm self-end">
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-green-500 min-w-0"
                aria-label="From date"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-green-500 min-w-0"
                aria-label="To date"
              />
            </div>
          )}
        </div>
      </div>

      <div className={fetching ? 'space-y-6 sm:space-y-8 opacity-60 transition-opacity' : 'space-y-6 sm:space-y-8'}>
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
                    {card.label === 'Revenue' && <MdTrendingUp className="w-3.5 h-3.5 text-green-600" />}
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Revenue Trend — {periodLabel}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Period total:{' '}
                  <span className="font-semibold text-green-600">{formatINRFull(trendRevenue)}</span>
                </p>
              </div>
            </div>
            <RevenueBarChart data={trendSeries} />
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
              <p className="text-gray-500 text-sm py-8 text-center">No orders in this period.</p>
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
    </div>
  );
}
