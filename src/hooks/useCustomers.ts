import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Address } from '@/types';

export interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
}

export function useCustomers(searchQuery?: string) {
  return useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      // Use profiles table directly with aggregated order data
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Get order counts for each profile
      const { data: orderStats } = await supabase
        .from('orders')
        .select('user_id, total');

      const statsMap = new Map<string, { order_count: number; total_spent: number; last_order_at: string | null }>();
      
      orderStats?.forEach(order => {
        if (!order.user_id) return;
        const existing = statsMap.get(order.user_id) || { order_count: 0, total_spent: 0, last_order_at: null };
        statsMap.set(order.user_id, {
          order_count: existing.order_count + 1,
          total_spent: existing.total_spent + (order.total || 0),
          last_order_at: existing.last_order_at,
        });
      });

      const customers: Customer[] = profiles?.map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        phone: p.phone,
        avatar_url: p.avatar_url,
        created_at: p.created_at || new Date().toISOString(),
        order_count: statsMap.get(p.id)?.order_count || 0,
        total_spent: statsMap.get(p.id)?.total_spent || 0,
        last_order_at: statsMap.get(p.id)?.last_order_at || null,
      })) || [];

      // Filter by search query
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return customers.filter(c => 
          c.email?.toLowerCase().includes(search) ||
          c.full_name?.toLowerCase().includes(search) ||
          c.phone?.includes(search)
        );
      }

      return customers;
    },
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      // Calculate stats
      const orderCount = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const lastOrderAt = orders?.[0]?.created_at || null;

      return {
        ...profile,
        order_count: orderCount,
        total_spent: totalSpent,
        last_order_at: lastOrderAt,
        orders,
      } as Customer & { orders: unknown[] };
    },
    enabled: !!customerId,
  });
}

export function useCustomerAddresses(customerId: string) {
  return useQuery({
    queryKey: ['customer-addresses', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', customerId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as Address[];
    },
    enabled: !!customerId,
  });
}

export function useCustomerOrders(customerId: string) {
  return useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
}