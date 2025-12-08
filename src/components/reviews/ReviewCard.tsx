import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewStars } from './ReviewStars';
import { Review } from '@/hooks/useReviews';
import { useVoteReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  index?: number;
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const voteReview = useVoteReview();

  const handleVote = (isHelpful: boolean) => {
    if (!user) return;
    voteReview.mutate({ reviewId: review.id, isHelpful });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="border-b border-border pb-6 last:border-0"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ReviewStars rating={review.rating} size="sm" />
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
              {review.is_featured && (
                <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded">
                  Featured
                </span>
              )}
            </div>

            {review.title && (
              <h4 className="font-medium mb-1">{review.title}</h4>
            )}

            <p className="text-foreground/80 text-sm leading-relaxed mb-3">
              {review.content}
            </p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {review.images.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(image)}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                  >
                    <img
                      src={image}
                      alt={`Review image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {review.user_profile?.full_name || 'Anonymous'} •{' '}
                {format(new Date(review.created_at), 'MMM d, yyyy')}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  disabled={!user || voteReview.isPending}
                  className={cn('text-xs gap-1 h-7 px-2')}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {review.helpful_count > 0 && review.helpful_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  disabled={!user || voteReview.isPending}
                  className="text-xs gap-1 h-7 px-2"
                >
                  <ThumbsDown className="h-3 w-3" />
                  {review.unhelpful_count > 0 && review.unhelpful_count}
                </Button>
              </div>
            </div>

            {/* Admin Reply */}
            {review.admin_reply && (
              <div className="mt-4 ml-4 p-4 bg-secondary/50 rounded-lg border-l-2 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Response from Mystamoura</span>
                  {review.admin_reply_at && (
                    <span className="text-xs text-muted-foreground">
                      • {format(new Date(review.admin_reply_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80">{review.admin_reply}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage}
            alt="Review image"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}