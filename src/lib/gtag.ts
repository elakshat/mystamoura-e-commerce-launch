// Google Analytics 4 utility

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let gaReady = false;

// Initialize GA4 script — call from useEffect, not module scope
export function initGA() {
  if (!GA_MEASUREMENT_ID) return;

  // Prevent duplicate initialization
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = () => { gaReady = true; };
  document.head.appendChild(script);
}

function isReady() {
  return !!GA_MEASUREMENT_ID && typeof window.gtag === 'function';
}

// Track page views
export function trackPageView(path: string, title?: string) {
  if (!isReady()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

// Track view_item (product impression)
export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  variant?: string;
  currency?: string;
}) {
  if (!isReady()) return;
  window.gtag('event', 'view_item', {
    currency: item.currency || 'INR',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_variant: item.variant,
      price: item.price,
    }],
  });
}

// Track search
export function trackSearch(searchTerm: string) {
  if (!isReady()) return;
  window.gtag('event', 'search', { search_term: searchTerm });
}

// Track login
export function trackLogin(method: string = 'email') {
  if (!isReady()) return;
  window.gtag('event', 'login', { method });
}

// Track sign_up
export function trackSignUp(method: string = 'email') {
  if (!isReady()) return;
  window.gtag('event', 'sign_up', { method });
}

// Ecommerce: add_to_cart
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
}) {
  if (!isReady()) return;
  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_variant: item.variant,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
}

// Ecommerce: begin_checkout
export function trackBeginCheckout(items: Array<{
  id: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
}>, value: number) {
  if (!isReady()) return;
  window.gtag('event', 'begin_checkout', {
    currency: 'INR',
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_variant: i.variant,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

// Ecommerce: purchase
export function trackPurchase(transactionId: string, value: number, items: Array<{
  id: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
}>) {
  if (!isReady()) return;
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_variant: i.variant,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

// Type augmentation
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
