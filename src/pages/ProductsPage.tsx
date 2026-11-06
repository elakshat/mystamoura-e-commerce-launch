import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { ProductGrid } from '@/components/products/ProductGrid';
import { PageHero } from '@/components/brand/PageHero';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = useProducts({ categorySlug: selectedCategory || undefined });
  const { data: categories } = useCategories();

  const tabs = [{ slug: null as string | null, name: 'All' }, ...(categories?.map((c) => ({ slug: c.slug as string | null, name: c.name })) ?? [])];

  return (
    <MainLayout>
      <SEOHead
        title="Our Collection"
        description="Browse our complete collection of luxury fragrances. Find your perfect signature scent from Mystamoura."
      />

      <PageHero
        eyebrow="The Collection"
        title={<>All <em className="font-light">fragrances</em></>}
        description="Discover our curated selection of luxury fragrances, each crafted with the finest ingredients."
      />

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
