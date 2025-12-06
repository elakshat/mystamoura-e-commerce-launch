import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

const collectionImages: Record<string, string> = {
  'for-him': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
  'for-her': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
  'unisex': 'https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=800',
};

export function Collections() {
  const { data: categories } = useCategories();

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-primary font-medium tracking-[0.2em] text-sm mb-3">
            EXPLORE
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold">
            Our Collections
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories?.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={`/collections/${category.slug}`}
                className="group block relative aspect-[4/5] overflow-hidden rounded-lg"
              >
                <img
                  src={category.image_url || collectionImages[category.slug] || collectionImages['unisex']}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center text-primary font-medium text-sm group-hover:underline">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
