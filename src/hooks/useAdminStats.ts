import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  pendingOrders: number;
}

export interface BestSellingProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  customer_email?: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's orders
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString());

      if (ordersError) throw ordersError;

      const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Get products count and low stock
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock');

      if (productsError) throw productsError;

      const lowStockProducts = products?.filter((p) => (p.stock || 0) <= 5).length || 0;

      // Get pending orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['pending', 'paid', 'processing']);

      if (pendingError) throw pendingError;

      // Get unique customers (approximation from profiles)
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (customersError) throw customersError;

      return {
        todaySales,
        todayOrders: todayOrders?.length || 0,
        totalProducts: products?.length || 0,
        lowStockProducts,
        totalCustomers: customersCount || 0,
        pendingOrders: pendingOrders?.length || 0,
      };
    },
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ['recent-orders', limit],
    queryFn: async (): Promise<RecentOrder[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at, guest_email')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        total: Number(order.total),
        status: order.status || 'pending',
        created_at: order.created_at || '',
        customer_email: order.guest_email || undefined,
      }));
    },
  });
}

export function useActivityLog(limit = 10) {
  return useQuery({
    queryKey: ['activity-log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
