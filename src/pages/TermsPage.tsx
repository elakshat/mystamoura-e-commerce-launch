import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl font-semibold mb-8">Terms of Service</h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by the 
                terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                2. Use License
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of the materials on 
                Mystamoura's website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                3. Product Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We make every effort to display the colors and images of our products accurately. 
                However, we cannot guarantee that your device's display will accurately reflect 
                the actual colors of products.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                4. Pricing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All prices are listed in Indian Rupees (INR) and include applicable taxes. 
                We reserve the right to change prices at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                5. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Mystamoura shall not be liable for any indirect, incidental, special, or 
                consequential damages resulting from the use or inability to use our products 
                or services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mt-8 mb-4">
                6. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of 
                India, without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
