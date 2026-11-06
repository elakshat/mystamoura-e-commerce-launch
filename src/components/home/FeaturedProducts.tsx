import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Reveal } from '@/components/brand/Reveal';

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({ featured: true });

  return (
    <section className="on-nuit grain py-20 md:py-32" aria-labelledby="home-featured-title">
      <div className="container relative z-[2] mx-auto px-5 md:px-12">
        <Reveal className="mb-12 grid gap-6 md:mb-20 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-4 text-brass-light">
              <span className="font-display text-base italic tracking-normal normal-case">No. 01</span>
              <span className="h-px w-10 bg-current" /> The Signatures
            </p>
            <h2 id="home-featured-title" className="display-lg max-w-2xl text-balance">
              Every mood, <em className="font-light">bottled.</em>
            </h2>
          </div>
          <Link to="/products" className="link-line self-start md:self-end">
            Discover all <ArrowRight />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="animate-pulse space-y-4">
                  <div className="product-card-media bg-white/5" />
                  <div className="h-4 w-3/4 bg-white/5" />
                </div>
              ))
            : products?.slice(0, 4).map((product, i) => (
                <div key={product.id} className={i % 2 === 1 ? 'lg:translate-y-14' : ''}>
                  <ProductCard product={product} index={i} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
