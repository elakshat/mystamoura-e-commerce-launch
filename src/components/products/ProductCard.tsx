import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          {/* Image with lazy loading */}
          {product.images?.[0] && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-secondary animate-pulse" />
              )}
              <motion.img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className={cn(
                  'h-full w-full object-cover transition-all duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                  'group-hover:scale-105'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {isOnSale && (
              <span className="bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-2 py-0.5 rounded">
                SALE
              </span>
            )}
            {isSoldOut && (
              <span className="bg-muted text-muted-foreground text-[10px] md:text-xs font-bold px-2 py-0.5 rounded">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Quick Actions - Desktop only */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:block">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-background/90 hover:bg-background text-foreground backdrop-blur-sm"
              onClick={handleAddToCart}
              disabled={isSoldOut}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>

          {/* Wishlist */}
          <button
            className={cn(
              'absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300',
              isInWishlist 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background/80 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground'
            )}
            onClick={handleWishlistClick}
            disabled={isPending}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
            )}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-medium">{product.size}</p>
        <div className="flex items-baseline gap-2 pt-0.5">
          {isOnSale ? (
            <>
              <span className="font-bold text-sm md:text-base text-primary">
                {formatPrice(product.sale_price!, product.currency)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            <span className="font-bold text-sm md:text-base text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
        
        {/* Mobile Add to Cart */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 md:hidden text-xs"
          onClick={handleAddToCart}
          disabled={isSoldOut}
        >
          <ShoppingBag className="h-3 w-3 mr-1.5" />
          {isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
}