import { Truck, Shield, Sparkles, Gift } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹999' },
  { icon: Shield, title: '100% Authentic', description: 'Guaranteed genuine products' },
  { icon: Sparkles, title: 'Premium Quality', description: 'Finest ingredients used' },
  { icon: Gift, title: 'Gift Wrapping', description: 'Elegant packaging included' },
];

export function Features() {
  return (
    <section className="border-b border-border py-6 md:py-8">
      <div className="container mx-auto grid grid-cols-2 gap-x-5 gap-y-6 px-6 md:grid-cols-4 md:px-12">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.4} />
            <div className="min-w-0">
              <h2 className="font-sans text-xs md:text-sm font-medium">{title}</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
