import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { useIsInWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const { toggle: toggleWishlist, isPending } = useToggleWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isSoldOut = product.stock <= 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to save items to your wishlist', {
        action: {
          label: 'Sign In',
          onClick: () => window.location.assign('/auth'),
        },
      });
      return;
    }
    await toggleWishlist(product.id, isInWishlist || false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSoldOut) {
      addToCart(product);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="product-card group relative flex min-w-0 flex-col"
    >
      <div className="product-card-media relative overflow-hidden bg-nuit">
        <Link to={`/products/${product.slug}`} className="block h-full focus-ring" aria-label={`View ${product.name}`}>
          {product.images?.[0] && !imageError ? (
            <>
              {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-secondary" />}
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className={cn('h-full w-full object-cover', imageLoaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary font-display text-lg italic text-muted-foreground">
              Image coming soon
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="bg-[hsl(var(--nuit-foreground))] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--nuit))]">
              Sale
            </span>
          )}
          {isSoldOut && (
            <span className="border border-[hsl(var(--nuit-foreground)/0.5)] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--nuit-foreground))]">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors duration-300',
            isInWishlist
              ? 'bg-[hsl(var(--nuit-foreground))] text-[hsl(var(--nuit))]'
              : 'bg-[hsl(var(--nuit)/0.35)] text-[hsl(var(--nuit-foreground))] hover:bg-[hsl(var(--nuit-foreground))] hover:text-[hsl(var(--nuit))]'
          )}
          onClick={handleWishlistClick}
          disabled={isPending}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-current')} strokeWidth={1.5} />
          )}
        </button>

        {/* Quick add — slides up on hover, always visible on touch */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="product-quick-add absolute inset-x-0 bottom-0 flex h-12 items-center justify-center gap-2 bg-[hsl(var(--nuit-foreground)/0.94)] text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--nuit))] backdrop-blur-sm transition-colors hover:bg-[hsl(var(--nuit-foreground))] disabled:cursor-not-allowed disabled:opacity-70 max-md:h-10 max-md:text-[10px]"
        >
          {isSoldOut ? 'Sold out' : (<><Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add to bag</>)}
        </button>
      </div>

      {/* Details */}
      <Link to={`/products/${product.slug}`} className="mt-3 flex flex-col gap-1.5 md:mt-5 md:flex-row md:items-start md:justify-between md:gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-normal uppercase leading-tight tracking-[0.05em] md:text-[22px]">
            {product.name}
          </h3>
          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {[product.category?.name, product.size].filter(Boolean).join(' · ') || 'Eau de Parfum'}
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-2 md:block md:text-right">
          <p className="product-card-price tabular text-sm font-medium md:text-[15px]">
            {formatPrice(isOnSale ? (product.sale_price ?? product.price) : product.price, product.currency)}
          </p>
          {isOnSale && (
            <p className="tabular text-xs text-muted-foreground line-through">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
