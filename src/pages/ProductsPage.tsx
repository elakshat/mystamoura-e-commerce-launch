import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/products/ProductGrid';
import { motion } from 'framer-motion';
import { BottleShelf } from '@/components/products/BottleShelf';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = useProducts({ categorySlug: selectedCategory || undefined });
  const { data: categories } = useCategories();
  const { data: featured } = useProducts({ featured: true });

  const tabs = [{ slug: null as string | null, name: 'All' }, ...(categories?.map((c) => ({ slug: c.slug as string | null, name: c.name })) ?? [])];

  return (
    <MainLayout>
      <SEOHead
        title="Our Collection"
        description="Browse our complete collection of luxury fragrances. Find your perfect signature scent from Mystamoura."
      />

      <section className="on-nuit grain overflow-hidden">
        <div
          className="pointer-events-none absolute right-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--brass) / 0.35), transparent 65%)' }}
          aria-hidden="true"
        />
        <div className="container relative z-[2] mx-auto grid items-end gap-12 px-5 pb-4 pt-14 md:px-12 md:pb-6 md:pt-20 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pb-6 lg:col-span-5 lg:pb-20"
          >
            <p className="eyebrow mb-5 text-brass-light">The Collection</p>
            <h1 className="display-lg">All <em className="font-light">fragrances</em></h1>
            <p className="lede mt-6 max-w-md text-nuit-muted">
              Discover our curated selection of luxury fragrances, each crafted with the finest ingredients.
            </p>
          </motion.div>
          <BottleShelf products={featured ?? []} className="h-[240px] sm:h-[300px] lg:col-span-7 lg:h-[400px]" />
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur-md md:top-[76px]">
        <div className="container mx-auto flex items-center justify-between gap-6 px-5 md:px-12">
          <div className="scrollbar-hide -mb-px flex gap-7 overflow-x-auto md:gap-10" role="group" aria-label="Filter by collection">
            {tabs.map((tab) => {
              const active = selectedCategory === tab.slug;
              return (
                <button
                  key={tab.slug ?? 'all'}
                  type="button"
                  onClick={() => setSelectedCategory(tab.slug)}
                  aria-pressed={active}
                  className={cn(
                    'label-caps h-14 shrink-0 border-b text-[11px] transition-colors',
                    active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
          <p className="hidden shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            {isLoading ? '—' : `${products?.length ?? 0} ${products?.length === 1 ? 'scent' : 'scents'}`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-5 py-12 md:px-12 md:py-20">
        <ProductGrid products={products || []} loading={isLoading} />
      </div>
    </MainLayout>
  );
}
