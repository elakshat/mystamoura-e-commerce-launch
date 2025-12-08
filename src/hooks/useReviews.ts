import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  is_spam: boolean;
  helpful_count: number;
  unhelpful_count: number;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  product?: {
    name: string;
    slug: string;
    images: string[];
  };
}

export interface ReviewStats {
  average_rating: number;
  review_count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

type SortOption = 'recent' | 'helpful' | 'highest' | 'lowest';

export function useProductReviews(productId: string, sort: SortOption = 'recent', page = 1, limit = 10) {
  return useQuery({
    queryKey: ['reviews', productId, sort, page],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user_profile:profiles!reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .eq('is_spam', false);

      // Sorting
      switch (sort) {
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      return { reviews: data as unknown as Review[], total: count || 0 };
    },
    enabled: !!productId,
  });
}

export function useReviewStats(productId: string) {
  return useQuery({
    queryKey: ['review-stats', productId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .eq('is_spam', false);

      if (error) throw error;

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let total = 0;

      reviews?.forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++;
        total += review.rating;
      });

      const count = reviews?.length || 0;

      return {
        average_rating: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
        review_count: count,
        distribution,
      } as ReviewStats;
    },
    enabled: !!productId,
  });
}

export function useUserReview(productId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['user-review', productId, userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!productId && !!userId,
  });
}

export function useCanReview(productId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['can-review', productId, userId],
    queryFn: async () => {
      if (!userId) return { canReview: false, hasPurchased: false, hasReviewed: false };

      // Check if user has already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingReview) {
        return { canReview: false, hasPurchased: true, hasReviewed: true };
      }

      // Check if user has purchased
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!inner(product_id)
        `)
        .eq('user_id', userId)
        .in('status', ['paid', 'processing', 'shipped', 'delivered']);

      const hasPurchased = orders?.some(order => 
        (order.order_items as unknown as { product_id: string }[])?.some(item => item.product_id === productId)
      ) || false;

      return { canReview: true, hasPurchased, hasReviewed: false };
    },
    enabled: !!productId && !!userId,
  });
}

interface CreateReviewInput {
  product_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to review');

      // Check if verified purchase
      const { data: orders } = await supabase
        .from('orders')
        .select(`id, order_items!inner(product_id)`)
        .eq('user_id', user.id)
        .in('status', ['paid', 'processing', 'shipped', 'delivered']);

      const isVerifiedPurchase = orders?.some(order =>
        (order.order_items as unknown as { product_id: string }[])?.some(item => item.product_id === input.product_id)
      ) || false;

      // Find the order_id if verified
      let orderId = null;
      if (isVerifiedPurchase) {
        const order = orders?.find(order =>
          (order.order_items as unknown as { product_id: string }[])?.some(item => item.product_id === input.product_id)
        );
        orderId = order?.id;
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...input,
          user_id: user.id,
          order_id: orderId,
          is_verified_purchase: isVerifiedPurchase,
          is_approved: false, // Requires admin approval
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['can-review', variables.product_id] });
      toast.success('Review submitted! It will be visible after approval.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });
}

export function useVoteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to vote');

      const { data, error } = await supabase
        .from('review_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to vote');
    },
  });
}

// Admin hooks
export function useAdminReviews(status?: 'pending' | 'approved' | 'spam') {
  return useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user_profile:profiles(full_name, avatar_url, email),
          product:products(name, slug, images)
        `)
        .order('created_at', { ascending: false });

      if (status === 'pending') {
        query = query.eq('is_approved', false).eq('is_spam', false);
      } else if (status === 'approved') {
        query = query.eq('is_approved', true);
      } else if (status === 'spam') {
        query = query.eq('is_spam', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Review[];
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Review updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Review deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
}

export function useAdminReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          admin_reply: reply,
          admin_reply_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Reply added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add reply');
    },
  });
}

export function useBulkUpdateReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Review> }) => {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Reviews updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reviews');
    },
  });
}