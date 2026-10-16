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
      className="product-card group relative"
    >
      <div className="product-card-media relative overflow-hidden bg-secondary">
        <Link to={`/products/${product.slug}`} className="block h-full focus-ring" aria-label={`View ${product.name}`}>
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
                  'group-hover:scale-[1.025]'
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
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="product-card-badge bg-primary text-primary-foreground">
              SALE
            </span>
          )}
          {isSoldOut && (
            <span className="product-card-badge bg-background text-muted-foreground">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2 right-2 h-10 w-10 rounded-sm transition-colors duration-200',
            isInWishlist
              ? 'bg-primary text-primary-foreground'
              : 'bg-background/90 opacity-100 hover:bg-primary hover:text-primary-foreground'
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
        </Button>
      </div>

      {/* Product Info */}
      <div className="product-card-details">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-base md:text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-medium">{product.size}</p>
        <div className="flex items-baseline gap-2 pt-0.5">
          {isOnSale ? (
            <>
              <span className="product-card-price font-medium text-sm md:text-base text-primary">
                {formatPrice(product.sale_price ?? product.price, product.currency)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            <span className="product-card-price font-medium text-sm md:text-base text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>

        {/* The same purchase action remains visible at every screen size. */}
        <Button
          variant="outline"
          size="sm"
          className="product-card-action"
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
