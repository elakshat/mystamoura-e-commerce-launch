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
          className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-4 md:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {product.name}{variant ? ` - ${variant.size}` : ''}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">
                  {formatPrice(price, product.currency)}
                </span>
                {isOnSale && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(originalPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-secondary transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(stock, quantity + 1))}
                className="p-2 hover:bg-secondary transition-colors"
                disabled={quantity >= stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              className="bg-gradient-gold text-primary-foreground hover:opacity-90"
              onClick={onAddToCart}
              disabled={isSoldOut}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
