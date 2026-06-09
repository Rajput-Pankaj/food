import { API_URL } from '../config/api';
import { MEDIA_PLACEHOLDER } from '../constants/media';

function normalizeLegacyMediaPath(url) {
  if (!url?.startsWith('/media/')) return url;
  return url
    .replace('/media/seed/', '/assets/media/')
    .replace('/media/blog/', '/assets/media/blog/')
    .replace('/media/placeholder.svg', MEDIA_PLACEHOLDER);
}

/** Resolve a stored media path for use in img src. */
export function resolveMediaUrl(url) {
  if (!url) return MEDIA_PLACEHOLDER;
  url = normalizeLegacyMediaPath(url);
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/api/')) {
    if (API_URL?.startsWith('http')) {
      return `${API_URL.replace(/\/api\/?$/, '')}${url}`;
    }
    return url;
  }
  return url;
}
