import { useCallback, useEffect, useState } from 'react';
import { favoritesApi } from '../api';
import { USE_API } from '../config/api';

const STORAGE_KEY = 'foodexpress_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(USE_API);

  const load = useCallback(async () => {
    if (USE_API) {
      const items = await favoritesApi.list();
      setFavorites(items);
    } else {
      setFavorites(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = (menuItemId) =>
    favorites.some((item) => Number(item.id) === Number(menuItemId));

  const toggleFavorite = async (menuItem) => {
    const id = menuItem.id;
    if (USE_API) {
      if (isFavorite(id)) {
        await favoritesApi.remove(id);
      } else {
        await favoritesApi.add(id);
      }
      await load();
      return;
    }
    const next = isFavorite(id)
      ? favorites.filter((f) => f.id !== id)
      : [...favorites, menuItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
  };

  return { favorites, loading, isFavorite, toggleFavorite };
}
