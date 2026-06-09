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
  recentOrders: [],
};

export function useAdminStats() {
  const [stats, setStats] = useState(() => (USE_API ? EMPTY_STATS : getOrderStats()));
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await adminApi.stats();
          setStats({
            totalOrders: data.totalOrders ?? 0,
            revenue: data.revenue ?? 0,
            avgOrderValue: data.avgOrderValue ?? 0,
            byStatus: data.byStatus ?? {},
            pendingCount: data.pendingCount ?? 0,
            revenueTrend: data.revenueTrend ?? [],
            recentOrders: data.recentOrders ?? [],
          });
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        } finally {
          setLoading(false);
        }
        return;
      }
      setStats(getOrderStats());
    };

    refresh();
    window.addEventListener('orders-updated', refresh);
    return () => window.removeEventListener('orders-updated', refresh);
  }, []);

  return { stats, loading };
}
