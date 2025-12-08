import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { toast } from 'sonner';

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          created_at,
          product:products(*, category:categories(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as { id: string; created_at: string; product: Product & { category: Category | null } }[];
    },
  });
}

export function useIsInWishlist(productId: string) {
  return useQuery({
    queryKey: ['wishlist-item', productId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!productId,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-item', productId] });
      toast.success('Added to wishlist');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.info('Already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-item', productId] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    },
  });
}

export function useToggleWishlist() {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return {
    toggle: async (productId: string, isInWishlist: boolean) => {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(productId);
      } else {
        await addToWishlist.mutateAsync(productId);
      }
    },
    isPending: addToWishlist.isPending || removeFromWishlist.isPending,
  };
}