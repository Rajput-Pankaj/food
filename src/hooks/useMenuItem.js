import { useCallback, useEffect, useState } from 'react';
import { menuApi } from '../api';
import { USE_API } from '../config/api';
import { getPublicMenuItemById } from '../utils/menuStorage';

export function useMenuItem(itemId) {
  const [item, setItem] = useState(() =>
    USE_API ? null : getPublicMenuItemById(itemId)
  );
  const [loading, setLoading] = useState(USE_API);

  const refresh = useCallback(async () => {
    if (USE_API) {
      try {
        const data = await menuApi.get(itemId);
        setItem(data);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
      return;
    }
    setItem(getPublicMenuItemById(itemId));
  }, [itemId]);

  useEffect(() => {
    refresh();
    const handleMenuUpdate = () => refresh();
    window.addEventListener('menu-updated', handleMenuUpdate);
    return () => window.removeEventListener('menu-updated', handleMenuUpdate);
  }, [refresh]);

  return { item, loading };
}
