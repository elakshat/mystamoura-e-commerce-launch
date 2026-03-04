import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

const DEFAULT_FAVICON = '/favicon.png';

function applyFavicon(href: string) {
  const normalized = href.trim();
  if (!normalized) return;

  const existingLinks = document.querySelectorAll(
    "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
  );
  existingLinks.forEach((link) => link.remove());

  const type = normalized.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  const cacheBustedHref = `${normalized}${normalized.includes('?') ? '&' : '?'}v=${Date.now()}`;

  (['icon', 'shortcut icon', 'apple-touch-icon'] as const).forEach((rel) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.type = type;
    link.href = cacheBustedHref;
    if (rel === 'icon') link.setAttribute('sizes', '32x32');
    document.head.appendChild(link);
  });
}

export function DynamicFavicon() {
  const { data: settings } = useSettings();

  useEffect(() => {
    const faviconUrl = ((settings as any)?.favicon_url as string | undefined)?.trim();
    applyFavicon(faviconUrl || DEFAULT_FAVICON);
  }, [settings]);

  return null;
}

