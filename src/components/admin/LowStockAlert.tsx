import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useState } from 'react';

interface LowStockAlertProps {
  threshold?: number;
}

export function LowStockAlert({ threshold = 5 }: LowStockAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: lowStockProducts } = useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', threshold)
        .eq('is_visible', true)
        .order('stock', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  if (isDismissed || !lowStockProducts?.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-destructive mb-2">
              Low Stock Alert
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock
            </p>

            <div className="space-y-2">
              {lowStockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between bg-background/50 rounded-lg p-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 m-2.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded ${
                      product.stock === 0
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/products">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Link>
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 -mt-1 -mr-1"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
