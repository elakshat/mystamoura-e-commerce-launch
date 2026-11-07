import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { GiftBox } from '@/components/brand/GiftBox';
import { trackPurchase } from '@/lib/gtag';
import { trackPixelPurchase } from '@/lib/meta-pixel';
import { trackPixelEvent } from '@/utils/metaPixel';

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
            <GiftBox className="mx-auto h-32 w-36" />

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
