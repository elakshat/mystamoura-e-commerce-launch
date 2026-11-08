import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel, PanelEmpty } from './Panel';
import { isRealOrder } from '@/lib/orders';

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
        .select('product_id, product_name, product_image, quantity, total_price, order:orders!inner(status, payment_status), product:products(name, images)')
        .limit(2000);

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, BestSeller>();

      data.forEach((item) => {
        if (!item.product_id || !item.order || !isRealOrder(item.order)) return;

        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.total_sold += item.quantity;
          existing.revenue += Number(item.total_price);
        } else {
          // Prefer the catalogue's current name and photo; images saved on old orders can go stale.
          productMap.set(item.product_id, {
            product_id: item.product_id,
            product_name: item.product?.name || item.product_name,
            product_image: item.product?.images?.[0] || item.product_image,
            total_sold: item.quantity,
            revenue: Number(item.total_price),
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.total_sold - a.total_sold || b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  const top = bestSellers?.[0]?.total_sold || 1;

  return (
    <Panel eyebrow="By units sold" title="Best sellers" action={{ to: '/admin/products', label: 'Products' }}>
      {isLoading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : bestSellers?.length ? (
        <ol className="-my-1 divide-y divide-border">
          {bestSellers.map((p, i) => (
            <li key={p.product_id}>
              <Link to={`/admin/products/${p.product_id}/edit`} className="group flex items-center gap-4 py-3">
                <span className="tabular w-4 shrink-0 text-center font-display text-lg leading-none text-brass">{i + 1}</span>
                <Thumb src={p.product_image} name={p.product_name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-display text-[17px] uppercase leading-tight tracking-[0.04em] transition-colors group-hover:text-brass">{p.product_name}</p>
                    <p className="tabular shrink-0 text-sm font-medium">{formatPrice(p.revenue)}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-brass" style={{ width: `${Math.max(4, (p.total_sold / top) * 100)}%` }} />
                    </span>
                    <span className="tabular w-12 shrink-0 text-right text-[11px] text-muted-foreground">{p.total_sold} sold</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <PanelEmpty title="No sales yet" hint="Best sellers appear once orders come in." />
      )}
    </Panel>
  );
}

/** Arch thumbnail; falls back to the bottle's initial if the photo is missing or fails to load. */
function Thumb({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-t-full bg-secondary">
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-sm text-muted-foreground">{name.charAt(0)}</span>
      )}
    </span>
  );
}
