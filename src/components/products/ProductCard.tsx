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

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { data: isInWishlist } = useIsInWishlist(product.id);
  const { toggle: toggleWishlist, isPending } = useToggleWishlist();

  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isSoldOut = product.stock <= 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to save items');
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          {product.images?.[0] ? (
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded"
              >
                SALE
              </motion.span>
            )}
            {isSoldOut && (
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0, y: 20 }}
            className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
          >
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
          </motion.div>

          {/* Wishlist */}
          <button
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isInWishlist 
                ? 'bg-primary text-primary-foreground opacity-100' 
                : 'bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground'
            }`}
            onClick={handleWishlistClick}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">{product.size}</p>
        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="font-semibold text-primary">
                {formatPrice(product.sale_price!, product.currency)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}