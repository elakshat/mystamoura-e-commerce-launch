import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Coupon } from '@/types';
import { toast } from 'sonner';

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Coupon[];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) throw new Error('Invalid coupon code');

      const coupon = data as unknown as Coupon;

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Coupon has expired');
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        throw new Error('Coupon usage limit reached');
      }

      if (orderAmount < coupon.min_order_amount) {
        throw new Error(`Minimum order amount is ₹${coupon.min_order_amount}`);
      }

      return coupon;
    },
  });
}

interface CreateCouponInput {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: CreateCouponInput) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, code: coupon.code.toUpperCase() })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create coupon: ${error.message}`);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...coupon }: Partial<CreateCouponInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(coupon)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update coupon: ${error.message}`);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete coupon: ${error.message}`);
    },
  });
}
