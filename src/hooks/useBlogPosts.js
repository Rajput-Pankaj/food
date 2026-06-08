import { useCallback, useEffect, useState } from 'react';
import { blogsApi } from '../api';
import { USE_API } from '../config/api';
import { getPublishedBlogPosts } from '../utils/blogStorage';

export function useBlogPosts({ admin = false } = {}) {
  const [posts, setPosts] = useState(() => (USE_API ? [] : getPublishedBlogPosts()));
  const [loading, setLoading] = useState(USE_API);

  const refresh = useCallback(async () => {
    if (USE_API) {
      try {
        const data = admin ? await blogsApi.adminList() : await blogsApi.list();
        setPosts(data);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    setPosts(getPublishedBlogPosts());
  }, [admin]);

  useEffect(() => {
    refresh();
    window.addEventListener('blog-updated', refresh);
    return () => window.removeEventListener('blog-updated', refresh);
  }, [refresh]);

  return { posts, refresh, loading };
}
