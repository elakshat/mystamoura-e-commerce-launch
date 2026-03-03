import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

const DEFAULT_FAVICON = '/favicon.png';

export function DynamicFavicon() {
  const { data: settings } = useSettings();

  useEffect(() => {
    const faviconUrl = (settings as any)?.favicon_url as string | undefined;
    const href = faviconUrl || DEFAULT_FAVICON;

    // Remove all existing favicon links to prevent duplicates
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((link) => link.remove());

    // Create new favicon link with cache-busting
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    link.href = `${href}?v=${Date.now()}`;
    document.head.appendChild(link);
  }, [settings]);

  return null;
}
