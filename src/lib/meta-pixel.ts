/**
 * Meta (Facebook) Pixel Integration
 * Dynamically loads pixel script and tracks standard e-commerce events.
 * Uses environment variable VITE_META_PIXEL_ID or runtime DB config.
 */

let PIXEL_ID: string | null = null;
let initialized = false;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

/**
 * Initialize Meta Pixel. Safe to call multiple times – only loads once.
 */
export function initMetaPixel(pixelId?: string) {
  const id = pixelId || import.meta.env.VITE_META_PIXEL_ID;
  if (!id || initialized) return;

  PIXEL_ID = id;
  initialized = true;

  // fbq shim
  const n: any = (window.fbq = function () {
    // eslint-disable-next-line prefer-rest-params
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];

  // Inject script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const first = document.getElementsByTagName('script')[0];
  first?.parentNode?.insertBefore(script, first);

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

function isReady(): boolean {
  return initialized && typeof window.fbq === 'function';
}

/** Track a page view – call on every route change */
export function trackPixelPageView() {
  if (!isReady()) return;
  window.fbq('track', 'PageView');
}

/** Track AddToCart */
export function trackPixelAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
}) {
  if (!isReady()) return;
  window.fbq('track', 'AddToCart', {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    value: item.price * item.quantity,
    currency: item.currency || 'INR',
    num_items: item.quantity,
  });
}

/** Track InitiateCheckout */
export function trackPixelInitiateCheckout(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  value: number
) {
  if (!isReady()) return;
  window.fbq('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
    })),
    content_type: 'product',
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value,
    currency: 'INR',
  });
}

/** Track Purchase */
export function trackPixelPurchase(
  transactionId: string,
  value: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
  if (!isReady()) return;
  window.fbq('track', 'Purchase', {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
    })),
    content_type: 'product',
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value,
    currency: 'INR',
    order_id: transactionId,
  });
}
