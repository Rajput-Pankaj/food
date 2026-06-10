import { formatINR, formatINRCompact } from '../../utils/currency';

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  preparing: '#8b5cf6',
  ready: '#06b6d4',
  shipped: '#6366f1',
  delivered: '#16a34a',
  rejected: '#ef4444',
  cancelled: '#9ca3af',
  unknown: '#d1d5db',
};

export function RevenueBarChart({ data = [] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  // With dense series (hourly / long ranges) only label every nth bar
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const gapClass = data.length > 16 ? 'gap-0.5 sm:gap-1' : 'gap-2 sm:gap-3';

  return (
    <div className={`h-52 flex items-end ${gapClass} pt-4`}>
      {data.map((day, index) => {
        const height = Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 8 : 4);
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full flex flex-col justify-end h-40 group relative">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-green-400 transition-all"
                style={{ height: `${height}%` }}
                title={`${day.shortLabel}: ${formatINR(day.revenue)}`}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {formatINRCompact(day.revenue)}
                {day.orders > 0 && ` · ${day.orders} orders`}
              </div>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate w-full text-center">
              {index % labelStep === 0 ? day.label : '\u00A0'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBarChart({ byStatus = {}, labels = {} }) {
  const entries = Object.entries(byStatus).filter(([, count]) => count > 0);
  const max = Math.max(...entries.map(([, c]) => c), 1);

  if (!entries.length) {
    return <p className="text-sm text-gray-500 py-8 text-center">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {entries
        .sort((a, b) => b[1] - a[1])
        .map(([status, count]) => {
          const width = Math.max((count / max) * 100, 6);
          const color = STATUS_COLORS[status] || STATUS_COLORS.unknown;
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                <span className="text-gray-600 truncate">{labels[status] || status}</span>
                <span className="font-semibold text-gray-800 shrink-0">{count}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

export function StatusDonut({ byStatus = {}, total = 0 }) {
  const entries = Object.entries(byStatus).filter(([, count]) => count > 0);
  if (!entries.length || total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No data
      </div>
    );
  }

  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const segments = entries.map(([status, count]) => {
    const pct = count / total;
    const dash = pct * circumference;
    const segment = {
      status,
      count,
      color: STATUS_COLORS[status] || STATUS_COLORS.unknown,
      dash,
      offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="18" />
        {segments.map((seg) => (
          <circle
            key={seg.status}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="flex-1 space-y-2 w-full">
        {segments.map((seg) => (
          <div key={seg.status} className="flex items-center justify-between text-xs gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-600 capitalize truncate">{seg.status.replace('_', ' ')}</span>
            </span>
            <span className="font-semibold text-gray-800">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
