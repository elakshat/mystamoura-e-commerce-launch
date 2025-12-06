import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = useProducts({ categorySlug: selectedCategory || undefined });
  const { data: categories } = useCategories();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Our Collection
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our curated selection of luxury fragrances, each crafted with the finest ingredients.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-primary text-primary-foreground' : ''}
          >
            All
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.slug)}
              className={selectedCategory === category.slug ? 'bg-primary text-primary-foreground' : ''}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <ProductGrid products={products || []} loading={isLoading} />
      </div>
    </MainLayout>
  );
}
