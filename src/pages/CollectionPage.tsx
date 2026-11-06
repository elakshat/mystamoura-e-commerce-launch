import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading } = useProducts({ categorySlug: slug });
  const { data: categories } = useCategories();

  const category = categories?.find((c) => c.slug === slug);

  return (
    <MainLayout>
      <section className="on-nuit grain overflow-hidden">
        <div className="container relative z-[2] mx-auto grid items-center gap-10 px-5 py-14 md:px-12 md:py-0 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="md:py-24"
          >
            <p className="eyebrow mb-5 text-brass-light">The Collection</p>
            <h1 className="display-xl">{category?.name || 'Collection'}</h1>
            {category?.description && (
              <p className="lede mt-8 max-w-md text-nuit-muted">{category.description}</p>
            )}

            <nav aria-label="Other collections" className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {categories?.map((c) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.slug}`}
                  aria-current={c.slug === slug ? 'page' : undefined}
                  className={cn(
                    'nav-link label-caps text-[11px]',
                    c.slug === slug ? 'text-nuit-foreground' : 'text-nuit-muted hover:text-nuit-foreground'
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {category?.image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease }}
              className="relative mx-auto w-full max-w-md lg:my-14"
            >
              <div className="arch aspect-[4/5]">
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-5 py-14 md:px-12 md:py-24">
        <div className="mb-10 flex items-baseline justify-between border-b pb-5 md:mb-14">
          <h2 className="font-display text-3xl font-light italic">The fragrances</h2>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {isLoading ? '—' : `${products?.length ?? 0} ${products?.length === 1 ? 'scent' : 'scents'}`}
          </p>
        </div>
        <ProductGrid products={products || []} loading={isLoading} />
      </div>
    </MainLayout>
  );
}
