import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface BestSeller {
  product_id: string;
  product_name: string;
  product_image: string | null;
  total_sold: number;
  revenue: number;
}

export function BestSellingProducts() {
  const { data: bestSellers, isLoading } = useQuery({
    queryKey: ['best-selling-products'],
    queryFn: async (): Promise<BestSeller[]> => {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, product_name, product_image, quantity, total_price')
        .limit(100);

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, BestSeller>();

      data.forEach((item) => {
        if (!item.product_id) return;

        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.total_sold += item.quantity;
          existing.revenue += Number(item.total_price);
        } else {
          productMap.set(item.product_id, {
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            total_sold: item.quantity,
            revenue: Number(item.total_price),
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-display text-xl font-semibold">Best Selling Products</h3>
      </div>

      {bestSellers?.length ? (
        <div className="space-y-4">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {product.product_image ? (
                  <img
                    src={product.product_image}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 m-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.total_sold} sold
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No sales data yet</p>
        </div>
      )}
    </motion.div>
  );
}
