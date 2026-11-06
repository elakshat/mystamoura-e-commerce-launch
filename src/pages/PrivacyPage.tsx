import { PolicyLayout } from '@/components/brand/PolicyLayout';

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      seoDescription="How Mystamoura collects, uses and protects your personal information."
      updated="December 2024"
      sections={[
        {
          title: 'Information We Collect',
          body: (
            <p>
              We collect information you provide directly to us, such as when you create an account, make a purchase, or
              contact us for support. This includes your name, email address, phone number, shipping address, and payment
              information.
            </p>
          ),
        },
        {
          title: 'How We Use Your Information',
          body: (
            <p>
              We use the information we collect to process orders, communicate with you about your orders and promotions,
              improve our services, and personalize your shopping experience.
            </p>
          ),
        },
        {
          title: 'Information Sharing',
          body: (
            <p>
              We do not sell or rent your personal information to third parties. We may share your information with service
              providers who assist us in operating our website and conducting our business, such as payment processors and
              shipping carriers.
            </p>
          ),
        },
        {
          title: 'Data Security',
          body: (
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
          ),
        },
        {
          title: 'Contact Us',
          body: (
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@mystamoura.in">hello@mystamoura.in</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
