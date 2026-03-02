import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  images: string[];
  is_visible: boolean;
  is_default: boolean;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('size', { ascending: true });

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.product_id] });
      toast.success('Variant created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create variant');
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success('Variant updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update variant');
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success('Variant deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete variant');
    },
  });
}

interface VariantInput {
  size: string;
  sku?: string | null;
  price: number;
  sale_price?: number | null;
  stock?: number;
  images?: string[];
  is_visible?: boolean;
  is_default?: boolean;
  weight?: number | null;
}

export function useBulkUpsertVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variants }: { productId: string; variants: VariantInput[] }) => {
      // Upsert variants
      const { error } = await supabase
        .from('product_variants')
        .upsert(
          variants.map((v) => ({
            product_id: productId,
            size: v.size,
            sku: v.sku,
            price: v.price,
            sale_price: v.sale_price,
            stock: v.stock ?? 0,
            images: v.images ?? [],
            is_visible: v.is_visible ?? true,
            is_default: v.is_default ?? false,
            weight: v.weight,
          })),
          { onConflict: 'product_id,size' }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.productId] });
      toast.success('Variants saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save variants');
    },
  });
}
