import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isRealOrder } from '@/lib/orders';

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
      const { data: todayAll, error: ordersError } = await supabase
        .from('orders')
        .select('total, status, payment_status')
        .gte('created_at', today.toISOString());

      if (ordersError) throw ordersError;
      // Abandoned online checkouts and cancelled/refunded orders are not sales.
      const todayOrders = todayAll?.filter(isRealOrder);

      const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Get products count and low stock
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock, is_visible');

      if (productsError) throw productsError;

      // Only products customers can see; hidden/'coming soon' items aren't a stock problem.
      const lowStockProducts = products?.filter((p) => p.is_visible && (p.stock || 0) <= 5).length || 0;

      // Get pending orders
      const { data: openAll, error: pendingError } = await supabase
        .from('orders')
        .select('id, status, payment_status')
        .in('status', ['pending', 'paid', 'processing']);

      if (pendingError) throw pendingError;
      const pendingOrders = openAll?.filter(isRealOrder);

      // Unique buyers across real orders (accounts + guest emails). Profiles can't be
      // used here: row-level security only lets each user read their own profile.
      const { data: buyers, error: customersError } = await supabase
        .from('orders')
        .select('user_id, guest_email, status, payment_status');

      if (customersError) throw customersError;
      const customersCount = new Set(
        (buyers ?? []).filter(isRealOrder).map((o) => o.user_id || o.guest_email?.toLowerCase()).filter(Boolean)
      ).size;

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
