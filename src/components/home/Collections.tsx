import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { useRef } from 'react';

const collectionImages: Record<string, string> = {
  'for-him': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
  'for-her': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
  'unisex': 'https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=800',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function Collections() {
  const { data: categories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            whileInView={{ opacity: 1, letterSpacing: '0.2em' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-primary font-medium text-sm mb-3"
          >
            EXPLORE
          </motion.p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold">
            Our Collections
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {categories?.map((category, index) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              style={{ y: index === 1 ? y : undefined }}
            >
              <Link
                to={`/collections/${category.slug}`}
                className="group block relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img
                    src={category.image_url || collectionImages[category.slug] || collectionImages['unisex']}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                  <motion.h3
                    className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {category.name}
                  </motion.h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 max-w-xs">
                    {category.description}
                  </p>
                  <motion.span
                    className="inline-flex items-center text-primary font-medium text-sm"
                    whileHover={{ x: 5 }}
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
