import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';

export default function RefundPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl font-semibold mb-8">Refund Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Returns & Exchanges
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We want you to be completely satisfied with your purchase. If you are not happy 
                with your order, you may return it within 7 days of delivery for a full refund 
                or exchange.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Conditions for Return
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Items must be unused and in their original packaging</li>
                <li>Items must be returned within 7 days of delivery</li>
                <li>Proof of purchase is required</li>
                <li>Sealed products must remain sealed</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Damaged or Defective Items
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you receive a damaged or defective item, please contact us within 48 hours 
                of delivery with photos of the damage. We will arrange for a replacement or 
                full refund at no additional cost to you.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Refund Process
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Once we receive your return, we will inspect the item and process your refund 
                within 5-7 business days. Refunds will be credited to the original payment method.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To initiate a return, please contact us at hello@mystamoura.in with your order 
                number and reason for return.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
