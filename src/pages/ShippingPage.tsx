import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ShippingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl font-semibold mb-8">Shipping Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Shipping Rates
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Standard Shipping: ₹99 (5-7 business days)</li>
                <li>Express Shipping: ₹199 (2-3 business days)</li>
                <li>FREE Shipping on orders above ₹1,500</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Delivery Areas
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We currently ship to all major cities and towns across India. Delivery to remote 
                areas may take additional 2-3 business days.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Order Processing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Orders are processed within 1-2 business days. You will receive a shipping 
                confirmation email with tracking information once your order has been dispatched.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Delivery Times
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estimated delivery times are calculated from the date of dispatch. Please note 
                that these are estimates and actual delivery times may vary based on your location 
                and other factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Packaging
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All orders are carefully packaged to ensure your fragrances arrive in perfect 
                condition. Each bottle is wrapped securely and placed in our signature gift box.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
