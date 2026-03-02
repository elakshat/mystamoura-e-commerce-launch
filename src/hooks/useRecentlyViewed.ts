import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const SESSION_KEY = 'mystamoura_session_id';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useRecentlyViewed(limit = 8) {
  const { user } = useAuth();
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['recently-viewed', user?.id || sessionId, limit],
    queryFn: async (): Promise<Product[]> => {
      const query = supabase
        .from('recently_viewed')
        .select('product_id, viewed_at, products:product_id(*)')
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (user?.id) {
        query.eq('user_id', user.id);
      } else {
        query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || [])
        .map((item: any) => item.products)
        .filter(Boolean) as Product[];
    },
  });
}

export function useTrackProductView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Delete existing entry first to avoid duplicates
      const deleteQuery = supabase
        .from('recently_viewed')
        .delete();

      if (user?.id) {
        deleteQuery.eq('user_id', user.id).eq('product_id', productId);
      } else {
        deleteQuery.eq('session_id', sessionId).eq('product_id', productId);
      }

      await deleteQuery;

      // Insert new entry
      const { error } = await supabase.from('recently_viewed').insert({
        product_id: productId,
        user_id: user?.id || null,
        session_id: user?.id ? null : sessionId,
        viewed_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
    },
  });
}

export function useTrackView(productId: string | undefined) {
  const { mutate: trackView } = useTrackProductView();

  useEffect(() => {
    if (productId) {
      trackView(productId);
    }
  }, [productId, trackView]);
}
