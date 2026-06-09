import { useCallback, useEffect, useState } from 'react';
import { deleteMedia, listMedia, uploadMedia } from '../utils/mediaStorage';

export function useMedia(options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMedia(options);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load media.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [options.folder, options.limit, options.offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async (file, meta = {}) => {
    const saved = await uploadMedia(file, meta);
    await refresh();
    return saved;
  };

  const remove = async (id) => {
    await deleteMedia(id);
    await refresh();
  };

  return { items, loading, error, refresh, upload, remove };
}
