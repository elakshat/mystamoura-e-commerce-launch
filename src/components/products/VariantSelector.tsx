import { motion } from 'framer-motion';
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

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-caps text-[11px] text-muted-foreground">Size</p>
        {selectedVariant && <p className="font-display text-base italic">{selectedVariant.size}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {sortedVariants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <button
              type="button"
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              aria-pressed={isSelected}
              className={cn(
                'relative h-12 min-w-[84px] px-5 text-sm transition-[box-shadow,color] duration-300',
                isSelected ? 'text-foreground' : 'emboss text-foreground/80 hover:text-foreground',
                isOutOfStock && 'cursor-not-allowed text-muted-foreground line-through opacity-50'
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="variant-selected"
                  className="deboss absolute inset-0"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative tabular font-medium tracking-wide">{variant.size}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
