import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      <GuidanceTile count={products.length} />
    </div>
  );
}

// Column spans that close an unfinished last row, per breakpoint (2 / 3 / 4 columns).
const SPAN_SM: Record<number, string> = { 0: 'hidden', 1: 'flex col-span-1' };
const SPAN_MD: Record<number, string> = { 0: 'md:hidden', 1: 'md:flex md:col-span-2', 2: 'md:flex md:col-span-1' };
const SPAN_LG: Record<number, string> = { 0: 'lg:hidden', 1: 'lg:flex lg:col-span-3', 2: 'lg:flex lg:col-span-2', 3: 'lg:flex lg:col-span-1' };

/** Editorial tile that fills the empty end of the grid instead of leaving a gap. */
function GuidanceTile({ count }: { count: number }) {
  const cls = [SPAN_SM[count % 2], SPAN_MD[count % 3], SPAN_LG[count % 4]].join(' ');
  return (
    <Link
      to="/contact"
      className={`${cls} on-nuit grain group relative min-h-[260px] flex-col justify-between overflow-hidden p-6 md:p-10`}
    >
      <span aria-hidden className="arch pointer-events-none absolute -bottom-24 right-[-10%] h-[120%] w-[55%] max-w-[340px] border border-[hsl(var(--brass)/0.25)]" />
      <p className="eyebrow relative text-brass">Personal guidance</p>
      <div className="relative max-w-sm">
        <p className="font-display text-[28px] font-light leading-[1.05] md:text-[40px]">
          Not sure where <em className="font-light">to begin?</em>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-nuit-muted">
          Tell us what you love wearing and we will suggest the scent made for you.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-nuit-foreground">
          Write to the house
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
