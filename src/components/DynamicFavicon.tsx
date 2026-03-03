import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export function DynamicFavicon() {
  const { data: settings } = useSettings();

  useEffect(() => {
    const faviconUrl = (settings as any)?.favicon_url as string | undefined;
    
    // Only override if a custom favicon is set in settings
    if (!faviconUrl) return;

    // Remove all existing favicon links to prevent duplicates
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((link) => link.remove());

    // Create new favicon link with cache-busting
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    link.href = `${faviconUrl}?v=${Date.now()}`;
    document.head.appendChild(link);
  }, [settings]);

  return null;
}
