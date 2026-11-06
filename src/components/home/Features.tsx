import { Truck, ShieldCheck, Gift, Sparkles } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹999' },
  { icon: ShieldCheck, title: '100% Authentic', description: 'Guaranteed genuine products' },
  { icon: Sparkles, title: 'Premium Quality', description: 'Finest ingredients used' },
  { icon: Gift, title: 'Gift Wrapping', description: 'Elegant packaging included' },
];

/** The house promises, set as a quiet ruled strip. */
export function Features() {
  return (
    <section className="border-y bg-background" aria-label="Shopping benefits">
      <div className="container mx-auto grid grid-cols-2 px-5 md:px-12 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className={[
              'flex items-center gap-4 py-7 md:py-9',
              i % 2 === 1 ? 'border-l pl-4 md:pl-8' : '',
              i >= 2 ? 'border-t lg:border-t-0' : '',
              i === 2 ? 'lg:border-l lg:pl-8' : '',
            ].join(' ')}
          >
            <Icon className="h-6 w-6 shrink-0 text-brass" strokeWidth={1} />
            <div className="min-w-0">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.2em]">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
