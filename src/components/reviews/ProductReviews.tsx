import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { RatingDistribution } from './RatingDistribution';
import { useProductReviews, useReviewStats, useCanReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductReviewsProps {
  productId: string;
}

type SortOption = 'recent' | 'helpful' | 'highest' | 'lowest';

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  
  const { user } = useAuth();
  const { data: reviewsData, isLoading } = useProductReviews(productId, sort, page);
  const { data: stats, isLoading: statsLoading } = useReviewStats(productId);
  const { data: canReviewData } = useCanReview(productId, user?.id);

  const reviews = reviewsData?.reviews || [];
  const canReview = canReviewData?.canReview && user;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Write Review */}
        <div className="space-y-6">
          {statsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : stats && stats.review_count > 0 ? (
            <RatingDistribution stats={stats} />
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to review this product</p>
            </div>
          )}

          {canReview && !showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              Write a Review
            </Button>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              <a href="/auth" className="text-primary hover:underline">Sign in</a> to write a review
            </p>
          )}

          {user && canReviewData?.hasReviewed && (
            <p className="text-sm text-muted-foreground text-center">
              You have already reviewed this product
            </p>
          )}

          {showForm && (
            <ReviewForm
              productId={productId}
              onSuccess={() => setShowForm(false)}
            />
          )}
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stats?.review_count} {stats?.review_count === 1 ? 'review' : 'reviews'}
              </span>
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No reviews to display</p>
            </motion.div>
          )}

          {/* Pagination */}
          {reviews.length > 0 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={reviews.length < 10}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}