// Google Analytics 4 utility

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Initialize GA4 script
export function initGA() {
  if (!GA_MEASUREMENT_ID) return;

  // Prevent duplicate initialization
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
}

// Track page views
export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

// Ecommerce: add_to_cart
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
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
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
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
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
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
