import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({ featured: true });

  return (
    <section className="home-featured py-16 md:py-24" aria-labelledby="home-featured-title">
      <div className="container mx-auto px-6 md:px-12">
        <div className="home-section-heading mb-10 md:mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="home-featured-title" className="font-display text-3xl md:text-5xl font-normal">Featured Collection</h2>
          <Button asChild variant="link" className="home-section-link h-auto rounded-none px-0 text-[hsl(var(--home-gold))] hover:text-[hsl(var(--home-ink))]">
            <Link to="/products">View All Products<ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
          {isLoading ? Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-md" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          )) : products?.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}
