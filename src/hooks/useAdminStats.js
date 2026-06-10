import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { USE_API } from '../config/api';
import { getOrderStats } from '../utils/orderStorage';

const EMPTY_STATS = {
  totalOrders: 0,
  revenue: 0,
  avgOrderValue: 0,
  byStatus: {},
  pendingCount: 0,
  revenueTrend: [],
  trendBucket: null,
  recentOrders: [],
};

export function useAdminStats(range) {
  const from = range?.from ?? null;
  const to = range?.to ?? null;
  const fromMs = from ? from.getTime() : null;
  const toMs = to ? to.getTime() : null;

  const [stats, setStats] = useState(() => (USE_API ? EMPTY_STATS : getOrderStats(range)));
  const [loading, setLoading] = useState(USE_API);
  const [fetching, setFetching] = useState(USE_API);

  useEffect(() => {
    const fromDate = fromMs != null ? new Date(fromMs) : null;
    const toDate = toMs != null ? new Date(toMs) : null;

    const refresh = async () => {
      if (USE_API) {
        setFetching(true);
        try {
          const data = await adminApi.stats({
            from: fromDate ? fromDate.toISOString() : undefined,
            to: toDate ? toDate.toISOString() : undefined,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          setStats({
            totalOrders: data.totalOrders ?? 0,
            revenue: data.revenue ?? 0,
            avgOrderValue: data.avgOrderValue ?? 0,
            byStatus: data.byStatus ?? {},
            pendingCount: data.pendingCount ?? 0,
            revenueTrend: data.revenueTrend ?? [],
            trendBucket: data.trendBucket ?? null,
            recentOrders: data.recentOrders ?? [],
          });
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        } finally {
          setLoading(false);
          setFetching(false);
        }
        return;
      }
      setStats(getOrderStats({ from: fromDate, to: toDate }));
    };

    refresh();
    window.addEventListener('orders-updated', refresh);
    return () => window.removeEventListener('orders-updated', refresh);
  }, [fromMs, toMs]);

  return { stats, loading, fetching };
}
