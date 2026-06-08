import { useCallback, useEffect, useState } from 'react';
import { blogsApi } from '../api';
import { USE_API } from '../config/api';
import { getBlogPostBySlug } from '../utils/blogStorage';

export function useBlogPost(slug) {
  const [post, setPost] = useState(() => (USE_API ? null : getBlogPostBySlug(slug)));
  const [loading, setLoading] = useState(USE_API);

  const refresh = useCallback(async () => {
    if (USE_API) {
      try {
        const data = await blogsApi.getBySlug(slug);
        setPost(data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
      return;
    }
    setPost(getBlogPostBySlug(slug));
  }, [slug]);

  useEffect(() => {
    refresh();
    window.addEventListener('blog-updated', refresh);
    return () => window.removeEventListener('blog-updated', refresh);
  }, [refresh]);

  return { post, loading };
}
