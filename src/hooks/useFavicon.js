import { useEffect } from 'react';
import { useStoreSettings } from './useStoreSettings';
import { resolveMediaUrl } from '../utils/mediaUrl';

const DEFAULT_FAVICON = '/favicon.svg';

function ensureLink(rel) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  return link;
}

export function useFavicon() {
  const { settings } = useStoreSettings();

  useEffect(() => {
    const logoUrl = settings?.storeLogo ? resolveMediaUrl(settings.storeLogo) : null;
    const href = logoUrl || DEFAULT_FAVICON;

    const icon = ensureLink('icon');
    icon.href = href;
    icon.type = logoUrl ? '' : 'image/svg+xml';

    const apple = ensureLink('apple-touch-icon');
    apple.href = href;
  }, [settings?.storeLogo]);
}
