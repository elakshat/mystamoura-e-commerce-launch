import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isSoldOut = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                SALE
              </span>
            )}
            {isSoldOut && (
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-background/90 hover:bg-background text-foreground backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                if (!isSoldOut) {
                  addToCart(product);
                }
              }}
              disabled={isSoldOut}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
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
