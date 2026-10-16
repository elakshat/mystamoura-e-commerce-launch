import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts, useCategories } from '@/hooks/useProducts';

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading } = useProducts({ categorySlug: slug });
  const { data: categories } = useCategories();
  
  const category = categories?.find((c) => c.slug === slug);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-heading mb-12"
        >
          <h1 className="font-display text-4xl md:text-6xl font-normal mb-4">
            {category?.name || 'Collection'}
          </h1>
          {category?.description && (
            <p className="text-muted-foreground text-base max-w-2xl">
              {category.description}
            </p>
          )}
        </motion.div>

        <ProductGrid products={products || []} loading={isLoading} />
      </div>
    </MainLayout>
  );
}
