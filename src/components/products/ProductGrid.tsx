import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const gridClass = 'grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-16 lg:grid-cols-4';

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="product-card-media bg-secondary" />
            <div className="h-4 w-3/4 bg-secondary" />
            <div className="h-3 w-1/3 bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border-y py-24 text-center">
        <p className="font-display text-3xl font-light italic">Nothing here — yet.</p>
        <p className="mt-3 text-sm text-muted-foreground">New fragrances are being composed. Explore the full collection meanwhile.</p>
        <Link to="/products" className="link-line mt-8">View all fragrances</Link>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
