import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({ featured: true });

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs text-primary font-medium">BEST SELLERS</p>
            <h2 className="font-display text-3xl md:text-5xl font-normal">Featured Collection</h2>
          </div>
          <Button asChild variant="link" className="h-auto px-0 text-foreground">
            <Link to="/products">View All Products<ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-6">
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
