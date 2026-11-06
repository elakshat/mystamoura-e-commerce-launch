import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { trackPurchase } from '@/lib/gtag';
import { trackPixelPurchase } from '@/lib/meta-pixel';
import { trackPixelEvent } from '@/utils/metaPixel';

/** The signature gift box: ribboned in brass, its lid lifting as the order is confirmed. */
function GiftBox() {
  return (
    <svg viewBox="0 0 140 130" className="mx-auto h-32 w-36 drop-shadow-[0_14px_18px_rgba(40,25,15,0.18)]" aria-hidden="true">
      <defs>
        <linearGradient id="gb-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3ece0" />
          <stop offset="100%" stopColor="#dccfba" />
        </linearGradient>
        <linearGradient id="gb-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="18%" stopColor="#000" stopOpacity="0" />
          <stop offset="82%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="gb-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7d5f35" />
          <stop offset="35%" stopColor="#d8b67a" />
          <stop offset="55%" stopColor="#a8854f" />
          <stop offset="100%" stopColor="#6e5230" />
        </linearGradient>
      </defs>

      {/* base */}
      <rect x="28" y="62" width="84" height="58" fill="url(#gb-box)" />
      <rect x="28" y="62" width="84" height="58" fill="url(#gb-side)" />
      <rect x="64" y="62" width="12" height="58" fill="url(#gb-brass)" />
      <rect x="28" y="62" width="84" height="5" fill="#000" fillOpacity="0.1" />

      {/* lid + bow lift together */}
      <motion.g
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: -12, rotate: -5 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: '24px', originY: '62px' }}
      >
        <rect x="22" y="46" width="96" height="18" fill="url(#gb-box)" />
        <rect x="22" y="46" width="96" height="18" fill="url(#gb-side)" />
        <rect x="22" y="62" width="96" height="2" fill="#000" fillOpacity="0.12" />
        <rect x="64" y="46" width="12" height="18" fill="url(#gb-brass)" />
        <path d="M70 46 C58 30 40 30 44 40 C47 47 60 47 70 46Z" fill="url(#gb-brass)" />
        <path d="M70 46 C82 30 100 30 96 40 C93 47 80 47 70 46Z" fill="url(#gb-brass)" />
        <path d="M68 46 L60 56 M72 46 L80 56" stroke="url(#gb-brass)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="70" cy="45" r="4.5" fill="url(#gb-brass)" />
      </motion.g>
    </svg>
  );
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const orderNumber = location.state?.orderNumber || searchParams.get('order') || 'N/A';
  const paymentId = location.state?.paymentId || searchParams.get('txnid') || null;
  const orderTotal = location.state?.total || parseFloat(searchParams.get('amount') || '0') || 0;
  const orderItems = location.state?.items || [];
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current && orderNumber !== 'N/A' && orderTotal > 0) {
      tracked.current = true;
      trackPurchase(orderNumber, orderTotal, orderItems);
      trackPixelPurchase(orderNumber, orderTotal, orderItems);
      trackPixelEvent('Purchase', {
        value: orderTotal,
        currency: 'INR',
        content_type: 'product',
        order_id: orderNumber,
      });
    }
  }, [orderNumber, orderTotal, orderItems]);

  return (
    <MainLayout>
      <SEOHead title="Order Confirmed" description="Your order has been successfully placed." />
      <section className="grain bg-background">
        <div className="container relative z-[2] mx-auto px-5 py-20 md:px-12 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <GiftBox />

            <p className="eyebrow mb-5 mt-10 text-brass">Order confirmed</p>
            <h1 className="display-lg text-balance">Thank you — <em className="font-light">it’s on its way</em></h1>
            <p className="lede mx-auto mt-6 max-w-lg text-muted-foreground">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>

            <dl className={`mx-auto mt-12 grid max-w-lg gap-px bg-border text-left ${paymentId ? 'sm:grid-cols-2' : ''}`}>
              <div className={`bg-background p-6 ${paymentId ? 'sm:pl-0' : 'text-center'}`}>
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Order number</dt>
                <dd className="mt-2 font-display text-3xl">{orderNumber}</dd>
              </div>
              {paymentId && (
                <div className="bg-background p-6 sm:pr-0">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Payment ID</dt>
                  <dd className="mt-3 break-all font-mono text-sm">{paymentId}</dd>
                </div>
              )}
            </dl>

            <div className="mx-auto mt-10 flex max-w-lg items-start gap-4 border border-dashed border-foreground/30 p-5 text-left">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.4} />
              <div>
                <p className="text-sm font-medium">Confirmation Email Sent</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll also send you tracking information once your order ships.
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link to="/products" className="btn-maison">
                Continue shopping <ArrowRight />
              </Link>
              <Link to="/account" className="link-line">View orders</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
