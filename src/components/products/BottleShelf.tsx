import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface BottleShelfProps {
  products: Product[];
  className?: string;
}

// Staggered arch heights so the row reads like bottles set out on a shelf.
const heights = ['h-[78%]', 'h-[92%]', 'h-full', 'h-[88%]', 'h-[74%]'];

/** A row of real product photos in arches, standing on a brass shelf line. */
export function BottleShelf({ products, className }: BottleShelfProps) {
  const items = products.filter((p) => p.images?.[0]).slice(0, 5);
  if (items.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      <div className="flex h-full items-end justify-center gap-2 md:gap-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className={cn('w-1/5 max-w-[150px]', heights[i % heights.length])}
          >
            <Link
              to={`/products/${p.slug}`}
              className="group relative block h-full overflow-hidden rounded-t-full ring-1 ring-[hsl(var(--nuit-line))] transition-transform duration-700 ease-silk hover:-translate-y-3"
              aria-label={p.name}
            >
              <img src={p.images[0]} alt={p.name} loading="eager" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(var(--nuit)/0.85)] to-transparent px-2 pb-3 pt-10 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--nuit-foreground))] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {p.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      {/* the shelf */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--brass-light)/0.7)] to-transparent" />
      <div className="mx-auto h-6 w-4/5 bg-[radial-gradient(ellipse_at_top,hsl(var(--brass)/0.18),transparent_70%)]" />
    </div>
  );
}
