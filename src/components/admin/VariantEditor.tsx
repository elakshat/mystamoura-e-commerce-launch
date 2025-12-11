import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VariantData {
  id?: string;
  size: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_visible: boolean;
  is_default: boolean;
}

interface VariantEditorProps {
  variants: VariantData[];
  onChange: (variants: VariantData[]) => void;
  productSku?: string;
}

const AVAILABLE_SIZES = ['30ml', '50ml', '100ml', '200ml'];

export function VariantEditor({ variants, onChange, productSku }: VariantEditorProps) {
  const [activeVariants, setActiveVariants] = useState<string[]>(
    variants.map((v) => v.size)
  );

  const toggleSize = (size: string) => {
    if (activeVariants.includes(size)) {
      setActiveVariants(activeVariants.filter((s) => s !== size));
      onChange(variants.filter((v) => v.size !== size));
    } else {
      setActiveVariants([...activeVariants, size]);
      const newVariant: VariantData = {
        size,
        sku: productSku ? `${productSku}-${size.toUpperCase()}` : '',
        price: 0,
        sale_price: null,
        stock: 0,
        is_visible: true,
        is_default: variants.length === 0,
      };
      onChange([...variants, newVariant]);
    }
  };

  const updateVariant = (size: string, field: keyof VariantData, value: any) => {
    onChange(
      variants.map((v) => (v.size === size ? { ...v, [field]: value } : v))
    );
  };

  const setDefaultVariant = (size: string) => {
    onChange(
      variants.map((v) => ({ ...v, is_default: v.size === size }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Variants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Available Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SIZES.map((size) => (
              <Button
                key={size}
                type="button"
                variant={activeVariants.includes(size) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSize(size)}
              >
                {activeVariants.includes(size) && <span className="mr-1">✓</span>}
                {size}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {variants
            .sort((a, b) => AVAILABLE_SIZES.indexOf(a.size) - AVAILABLE_SIZES.indexOf(b.size))
            .map((variant, index) => (
              <motion.div
                key={variant.size}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">{variant.size}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variant.is_default}
                        onCheckedChange={() => setDefaultVariant(variant.size)}
                      />
                      <Label className="text-sm">Default</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variant.is_visible}
                        onCheckedChange={(checked) =>
                          updateVariant(variant.size, 'is_visible', checked)
                        }
                      />
                      <Label className="text-sm">Visible</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`sku-${variant.size}`}>SKU</Label>
                    <Input
                      id={`sku-${variant.size}`}
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(variant.size, 'sku', e.target.value)
                      }
                      placeholder="SKU-30ML"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${variant.size}`}>Price (₹)</Label>
                    <Input
                      id={`price-${variant.size}`}
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(variant.size, 'price', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sale-${variant.size}`}>Sale Price (₹)</Label>
                    <Input
                      id={`sale-${variant.size}`}
                      type="number"
                      value={variant.sale_price ?? ''}
                      onChange={(e) =>
                        updateVariant(
                          variant.size,
                          'sale_price',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`stock-${variant.size}`}>Stock</Label>
                    <Input
                      id={`stock-${variant.size}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(variant.size, 'stock', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {variants.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Select sizes above to add variants
          </p>
        )}
      </CardContent>
    </Card>
  );
}
