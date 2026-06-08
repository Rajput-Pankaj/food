import { useEffect, useState } from 'react';
import { USE_API } from '../config/api';
import {
  fetchAddresses,
  fetchReviewsByUser,
  getAddresses,
  getReviewsByUser,
} from '../utils/customerStorage';

export function useCustomerCounts(userId) {
  const [counts, setCounts] = useState(() => ({
    addresses: getAddresses(userId).length,
    reviews: getReviewsByUser(userId).length,
  }));

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const [addresses, reviews] = await Promise.all([
            fetchAddresses(),
            fetchReviewsByUser(),
          ]);
          setCounts({ addresses: addresses.length, reviews: reviews.length });
        } catch {
          setCounts({ addresses: 0, reviews: 0 });
        }
        return;
      }
      setCounts({
        addresses: getAddresses(userId).length,
        reviews: getReviewsByUser(userId).length,
      });
    };

    refresh();
    window.addEventListener('customer-addresses-updated', refresh);
    window.addEventListener('customer-reviews-updated', refresh);
    return () => {
      window.removeEventListener('customer-addresses-updated', refresh);
      window.removeEventListener('customer-reviews-updated', refresh);
    };
  }, [userId]);

  return counts;
}
