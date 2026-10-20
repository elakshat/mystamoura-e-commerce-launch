import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
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
      <SEOHead 
        title="Our Collection" 
        description="Browse our complete collection of luxury fragrances. Find your perfect signature scent from Mystamoura."
      />
      <div className="catalog-page container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-heading mb-12"
        >
          <h1 className="font-display text-4xl md:text-6xl font-normal mb-4 text-foreground">
            Our Collection
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
            Discover our curated selection of luxury fragrances, each crafted with the finest ingredients.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="catalog-tabs flex flex-wrap gap-3 mb-12" role="group" aria-label="Filter by collection">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={selectedCategory === null ? 'bg-primary text-primary-foreground' : ''}
          >
            All
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.slug)}
              aria-pressed={selectedCategory === category.slug}
              className={selectedCategory === category.slug ? 'bg-primary text-primary-foreground' : ''}
            >
              {category.name}
            </Button>
          ))}
          <span className="catalog-count" aria-live="polite">
            {isLoading ? 'Loading…' : `${products?.length || 0} fragrances`}
          </span>
        </div>

        <ProductGrid products={products || []} loading={isLoading} />
      </div>
    </MainLayout>
  );
}
