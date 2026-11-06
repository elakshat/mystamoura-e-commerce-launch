import { PolicyLayout } from '@/components/brand/PolicyLayout';

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      seoDescription="The terms that govern your use of the Mystamoura website and products."
      updated="December 2024"
      sections={[
        {
          title: 'Acceptance of Terms',
          body: (
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this
              agreement.
            </p>
          ),
        },
        {
          title: 'Use License',
          body: (
            <p>
              Permission is granted to temporarily download one copy of the materials on Mystamoura's website for personal,
              non-commercial transitory viewing only.
            </p>
          ),
        },
        {
          title: 'Product Information',
          body: (
            <p>
              We make every effort to display the colors and images of our products accurately. However, we cannot guarantee
              that your device's display will accurately reflect the actual colors of products.
            </p>
          ),
        },
        {
          title: 'Pricing',
          body: (
            <p>
              All prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to change
              prices at any time without prior notice.
            </p>
          ),
        },
        {
          title: 'Limitation of Liability',
          body: (
            <p>
              Mystamoura shall not be liable for any indirect, incidental, special, or consequential damages resulting from
              the use or inability to use our products or services.
            </p>
          ),
        },
        {
          title: 'Governing Law',
          body: (
            <p>
              These terms shall be governed by and construed in accordance with the laws of India, without regard to its
              conflict of law provisions.
            </p>
          ),
        },
      ]}
    />
  );
}
