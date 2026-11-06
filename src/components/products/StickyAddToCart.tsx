import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, ProductVariantInfo } from '@/types';
import { formatPrice } from '@/lib/utils';

interface StickyAddToCartProps {
  product: Product;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isVisible: boolean;
  variant?: ProductVariantInfo | null;
}

export function StickyAddToCart({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isVisible,
  variant,
}: StickyAddToCartProps) {
  const price = variant
    ? (variant.sale_price && variant.sale_price < variant.price ? variant.sale_price : variant.price)
    : (product.sale_price && product.sale_price < product.price ? product.sale_price! : product.price);
  const originalPrice = variant ? variant.price : product.price;
  const isOnSale = variant
    ? (variant.sale_price != null && variant.sale_price < variant.price)
    : (product.sale_price != null && product.sale_price < product.price);
  const stock = variant ? variant.stock : product.stock;
  const isSoldOut = stock <= 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="sticky-purchase glass-bar fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border px-4 py-3 md:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="truncate font-display text-base uppercase tracking-[0.06em]">
                {product.name}{variant ? ` · ${variant.size}` : ''}
              </h4>
              <div className="flex items-center gap-2">
                <span className="tabular text-sm font-medium">
                  {formatPrice(price, product.currency)}
                </span>
                {isOnSale && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(originalPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex h-11 items-center border border-foreground/30">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-secondary transition-colors"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(stock, quantity + 1))}
                className="p-2 hover:bg-secondary transition-colors"
                disabled={quantity >= stock}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              className="h-11 w-11 rounded-none bg-foreground p-0 text-background hover:bg-brass"
              onClick={onAddToCart}
              disabled={isSoldOut}
              aria-label={isSoldOut ? 'Sold Out' : 'Add to Cart'}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
