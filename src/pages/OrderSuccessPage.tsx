import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'N/A';

  return (
    <MainLayout>
      <SEOHead title="Order Confirmed" description="Your order has been successfully placed." />
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="h-12 w-12 text-primary" />
          </motion.div>

          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Order Number</span>
            </div>
            <p className="font-display text-2xl font-semibold">{orderNumber}</p>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            We'll send you an email with tracking information once your order ships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-gold text-primary-foreground">
              <Link to="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/account">View Orders</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
