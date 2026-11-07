import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel, PanelEmpty } from './Panel';
import { cn } from '@/lib/utils';

interface LowStockAlertProps {
  threshold?: number;
}

/** Inventory watch: visible products at or below the stock threshold. */
export function LowStockAlert({ threshold = 5 }: LowStockAlertProps) {
  const { data: lowStockProducts, isLoading } = useQuery({
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

  return (
    <Panel eyebrow={`${threshold} or fewer left`} title="Inventory watch" action={{ to: '/admin/products', label: 'Manage' }}>
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : lowStockProducts?.length ? (
        <ul className="divide-y divide-border">
          {lowStockProducts.map((product) => (
            <li key={product.id}>
              <Link to={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="h-11 w-8 shrink-0 overflow-hidden rounded-t-full bg-nuit">
                  {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-[11px] text-muted-foreground">SKU {product.sku || '—'}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]',
                    product.stock === 0
                      ? 'border-[hsl(2_40%_82%)] bg-[hsl(2_55%_93%)] text-[hsl(2_55%_36%)]'
                      : 'border-[hsl(36_60%_78%)] bg-[hsl(38_78%_91%)] text-[hsl(30_70%_30%)]'
                  )}
                >
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <PanelEmpty title="All well stocked" hint={`No visible product has ${threshold} or fewer left.`} />
      )}
    </Panel>
  );
}
