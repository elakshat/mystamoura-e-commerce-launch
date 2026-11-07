import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel } from './Panel';
import { formatPrice } from '@/lib/utils';
import { isRealOrder } from '@/lib/orders';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

interface SalesSummary {
  days: SalesData[];
  thisWeek: number;
  lastWeek: number;
  orders: number;
}

const BRASS = 'hsl(34 36% 46%)';

export function SalesChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['sales-chart-data'],
    queryFn: async (): Promise<SalesSummary> => {
      // One query for the last 14 days; split into this week and the week before.
      const start = startOfDay(subDays(new Date(), 13));
      const { data: rows, error } = await supabase
        .from('orders')
        .select('total, created_at, status, payment_status')
        .gte('created_at', start.toISOString());

      if (error) throw error;

      const byDay = new Map<string, { sales: number; orders: number }>();
      for (let i = 13; i >= 0; i--) byDay.set(format(subDays(new Date(), i), 'yyyy-MM-dd'), { sales: 0, orders: 0 });
      rows?.filter(isRealOrder).forEach((o) => {
        const key = format(new Date(o.created_at), 'yyyy-MM-dd');
        const d = byDay.get(key);
        if (d) { d.sales += Number(o.total); d.orders += 1; }
      });

      const all = [...byDay.entries()].map(([k, v]) => ({ date: format(new Date(k), 'd MMM'), ...v }));
      const last7 = all.slice(7);
      const prev7 = all.slice(0, 7);
      return {
        days: last7,
        thisWeek: last7.reduce((s, d) => s + d.sales, 0),
        lastWeek: prev7.reduce((s, d) => s + d.sales, 0),
        orders: last7.reduce((s, d) => s + d.orders, 0),
      };
    },
  });

  if (isLoading || !data) {
    return <Skeleton className="h-[388px] w-full rounded-sm" />;
  }

  const change = data.lastWeek > 0 ? ((data.thisWeek - data.lastWeek) / data.lastWeek) * 100 : null;

  return (
    <Panel
      eyebrow="Last 7 days"
      title="Sales overview"
      aside={
        <div className="text-right">
          <p className="tabular font-display text-3xl leading-none">{formatPrice(data.thisWeek)}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {data.orders} {data.orders === 1 ? 'order' : 'orders'}
            {change !== null ? (
              <span className={change >= 0 ? ' text-[hsl(145_35%_30%)]' : ' text-destructive'}>
                {' '}· {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(0)}% vs previous week
              </span>
            ) : (
              <span> · no sales the previous week</span>
            )}
          </p>
        </div>
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.days} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRASS} stopOpacity={0.28} />
                <stop offset="100%" stopColor={BRASS} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={8} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
            />
            <Tooltip
              cursor={{ stroke: BRASS, strokeOpacity: 0.4 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 2,
                boxShadow: '0 12px 30px -12px hsl(24 20% 10% / 0.25)',
                fontSize: 12,
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 11, marginBottom: 4 }}
              formatter={(value: number, _name, item) => [`${formatPrice(value)} · ${item.payload.orders} orders`, 'Sales']}
            />
            <Area type="monotone" dataKey="sales" stroke={BRASS} strokeWidth={1.8} fill="url(#salesGradient)" dot={false} activeDot={{ r: 4, fill: BRASS, stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
