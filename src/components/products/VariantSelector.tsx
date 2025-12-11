import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductVariant } from '@/hooks/useVariants';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const sortedVariants = [...variants].sort((a, b) => {
    const sizeOrder = ['30ml', '50ml', '100ml', '200ml'];
    return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
  });

  if (variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Size</p>
      <div className="flex flex-wrap gap-3">
        {sortedVariants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <motion.button
              key={variant.id}
              whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
              whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={cn(
                'relative px-6 py-3 rounded-lg border-2 transition-all duration-200 min-w-[100px]',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/50',
                isOutOfStock && 'opacity-50 cursor-not-allowed line-through'
              )}
            >
              <span className="font-medium">{variant.size}</span>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
