import { PolicyLayout } from '@/components/brand/PolicyLayout';

export default function RefundPage() {
  return (
    <PolicyLayout
      title="Returns & Refunds"
      seoDescription="Mystamoura's return, exchange and refund policy."
      intro="We want you to be completely satisfied with your purchase."
      sections={[
        {
          title: 'Returns & Exchanges',
          body: (
            <p>
              We want you to be completely satisfied with your purchase. If you are not happy with your order, you may return
              it within 7 days of delivery for a full refund or exchange.
            </p>
          ),
        },
        {
          title: 'Conditions for Return',
          body: (
            <ul>
              <li>Items must be unused and in their original packaging</li>
              <li>Items must be returned within 7 days of delivery</li>
              <li>Proof of purchase is required</li>
              <li>Sealed products must remain sealed</li>
            </ul>
          ),
        },
        {
          title: 'Damaged or Defective Items',
          body: (
            <p>
              If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the
              damage. We will arrange for a replacement or full refund at no additional cost to you.
            </p>
          ),
        },
        {
          title: 'Refund Process',
          body: (
            <p>
              Once we receive your return, we will inspect the item and process your refund within 5-7 business days. Refunds
              will be credited to the original payment method.
            </p>
          ),
        },
        {
          title: 'Contact Us',
          body: (
            <p>
              To initiate a return, please contact us at <a href="mailto:hello@mystamoura.in">hello@mystamoura.in</a> with
              your order number and reason for return.
            </p>
          ),
        },
      ]}
    />
  );
}
