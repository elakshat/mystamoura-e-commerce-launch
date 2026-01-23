import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, image_url }: { id: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ image_url, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Collection image updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update collection: ${error.message}`);
    },
  });
}
