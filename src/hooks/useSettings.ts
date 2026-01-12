import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SiteSettings } from '@/types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');

      if (error) throw error;

      const settings: Partial<SiteSettings> = {};
      data.forEach((item: { key: string; value: unknown }) => {
        (settings as Record<string, unknown>)[item.key] = item.value;
      });

      return settings as SiteSettings;
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Also invalidate tax-settings when tax or shipping is updated
      if (variables.key === 'tax' || variables.key === 'shipping') {
        queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      }
      toast.success('Settings updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });
}

// Alias for backwards compatibility
export const useUpdateSettings = useUpdateSetting;
