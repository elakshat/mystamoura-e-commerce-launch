import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export function SalesChart() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-chart-data'],
    queryFn: async (): Promise<SalesData[]> => {
      const days = 7;
      const results: SalesData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startOfDate = startOfDay(date).toISOString();
        const endOfDate = startOfDay(subDays(date, -1)).toISOString();

        const { data, error } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', startOfDate)
          .lt('created_at', endOfDate)
          .not('status', 'in', '("cancelled","refunded")');

        if (error) throw error;

        const sales = data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

        results.push({
          date: format(date, 'MMM d'),
          sales,
          orders: data?.length || 0,
        });
      }

      return results;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const totalSales = salesData?.reduce((sum, d) => sum + d.sales, 0) || 0;
  const prevWeekEstimate = totalSales * 0.85; // Placeholder
  const growthPercent = ((totalSales - prevWeekEstimate) / prevWeekEstimate) * 100;
  const isPositive = growthPercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>
        <div className="text-right">
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            ₹{totalSales.toLocaleString('en-IN')}
          </motion.p>
          <div
            className={`flex items-center justify-end gap-1 text-sm ${
              isPositive ? 'text-green-500' : 'text-destructive'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(growthPercent).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43 74% 49%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(43 74% 49%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(43 74% 49%)"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
