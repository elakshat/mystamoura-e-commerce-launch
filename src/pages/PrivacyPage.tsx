import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl font-semibold mb-8">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us for support. This includes your name, email address, 
                phone number, shipping address, and payment information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to process orders, communicate with you about your 
                orders and promotions, improve our services, and personalize your shopping experience.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                3. Information Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell or rent your personal information to third parties. We may share your 
                information with service providers who assist us in operating our website and conducting 
                our business, such as payment processors and shipping carriers.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                4. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                5. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at 
                hello@mystamoura.in.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
