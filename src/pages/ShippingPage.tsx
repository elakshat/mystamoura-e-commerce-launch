import { PolicyLayout } from '@/components/brand/PolicyLayout';

export default function ShippingPage() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      seoDescription="Mystamoura shipping rates, delivery areas and timelines across India."
      intro="Every order leaves our studio carefully wrapped in our signature gift box."
      sections={[
        {
          title: 'Shipping Rates',
          body: (
            <ul>
              <li>Standard Shipping: ₹99 (5-7 business days)</li>
              <li>Express Shipping: ₹199 (2-3 business days)</li>
              <li>FREE Shipping on orders above ₹1,500</li>
            </ul>
          ),
        },
        {
          title: 'Delivery Areas',
          body: (
            <p>
              We currently ship to all major cities and towns across India. Delivery to remote areas may take additional 2-3
              business days.
            </p>
          ),
        },
        {
          title: 'Order Processing',
          body: (
            <p>
              Orders are processed within 1-2 business days. You will receive a shipping confirmation email with tracking
              information once your order has been dispatched.
            </p>
          ),
        },
        {
          title: 'Delivery Times',
          body: (
            <p>
              Estimated delivery times are calculated from the date of dispatch. Please note that these are estimates and
              actual delivery times may vary based on your location and other factors beyond our control.
            </p>
          ),
        },
        {
          title: 'Packaging',
          body: (
            <p>
              All orders are carefully packaged to ensure your fragrances arrive in perfect condition. Each bottle is wrapped
              securely and placed in our signature gift box.
            </p>
          ),
        },
      ]}
    />
  );
}
