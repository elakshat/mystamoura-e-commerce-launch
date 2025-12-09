import { motion } from 'framer-motion';
import { Shield, Clock, Truck, Droplets } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Guaranteed genuine luxury fragrances',
  },
  {
    icon: Clock,
    title: 'Long-lasting',
    description: '8-12 hours of captivating scent',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Express delivery across India',
  },
  {
    icon: Droplets,
    title: 'Premium Oils',
    description: 'Crafted with finest ingredients',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function TrustBadges() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-card/50 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Why Choose Mystamoura
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the art of perfumery with our commitment to quality and authenticity
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {badges.map((badge) => (
            <motion.div
              key={badge.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center h-full transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-gold">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 transition-colors duration-300 group-hover:bg-primary/20"
                >
                  <badge.icon className="h-7 w-7" />
                </motion.div>
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
