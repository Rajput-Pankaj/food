import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { USE_API } from '../config/api';
import { getPublicUsers } from '../utils/authStorage';
import { getBlogStats } from '../utils/blogStorage';
import { getReviewStats } from '../utils/customerStorage';
import { getMenuStats } from '../utils/menuStorage';
import { getOrderStats } from '../utils/orderStorage';

function getLocalStats() {
  const orderStats = getOrderStats();
  const menuStats = getMenuStats();
  const blogStats = getBlogStats();
  const reviewStats = getReviewStats();
  const users = getPublicUsers();

  return {
    ...orderStats,
    menuCount: menuStats.total,
    blogCount: blogStats.published,
    reviewCount: reviewStats.total,
    customerCount: users.filter((user) => user.role === 'customer').length,
    reviewStats,
    menuStats,
    blogStats,
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState(getLocalStats);
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await adminApi.stats();
          setStats({
            ...data,
            reviewStats: { total: data.reviewCount, recent: [] },
            menuStats: { total: data.menuCount },
            blogStats: { published: data.blogCount },
          });
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        } finally {
          setLoading(false);
        }
        return;
      }
      setStats(getLocalStats());
    };

    refresh();
    window.addEventListener('orders-updated', refresh);
    window.addEventListener('menu-updated', refresh);
    window.addEventListener('blog-updated', refresh);
    window.addEventListener('customer-reviews-updated', refresh);
    return () => {
      window.removeEventListener('orders-updated', refresh);
      window.removeEventListener('menu-updated', refresh);
      window.removeEventListener('blog-updated', refresh);
      window.removeEventListener('customer-reviews-updated', refresh);
    };
  }, []);

  return { stats, loading };
}
