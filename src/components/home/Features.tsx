import { motion } from 'framer-motion';
import { Truck, Shield, Sparkles, Gift } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹1500',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Guaranteed genuine products',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'Finest ingredients used',
  },
  {
    icon: Gift,
    title: 'Gift Wrapping',
    description: 'Elegant packaging included',
  },
];

export function Features() {
  return (
    <section className="py-12 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-medium mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
