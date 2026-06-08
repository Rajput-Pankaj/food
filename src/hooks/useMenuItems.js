import { useCallback, useEffect, useState } from 'react';
import { menuApi } from '../api';
import { USE_API } from '../config/api';
import { getMenuItems } from '../utils/menuStorage';

export function useMenuItems({ admin = false } = {}) {
  const [items, setItems] = useState(() => (USE_API ? [] : getMenuItems()));
  const [loading, setLoading] = useState(USE_API);

  const refresh = useCallback(async () => {
    if (USE_API) {
      try {
        const data = admin ? await menuApi.adminList() : await menuApi.list();
        setItems(data);
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    setItems(getMenuItems());
  }, [admin]);

  useEffect(() => {
    refresh();
    const handleStorage = (event) => {
      if (!USE_API && (event.key === 'foodexpress_menu_overrides' || event.key === null)) {
        refresh();
      }
    };
    const handleMenuUpdate = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('menu-updated', handleMenuUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('menu-updated', handleMenuUpdate);
    };
  }, [refresh]);

  return { items, refresh, loading };
}
