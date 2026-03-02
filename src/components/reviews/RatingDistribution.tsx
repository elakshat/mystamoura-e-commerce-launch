import { motion } from 'framer-motion';
import { ReviewStars } from './ReviewStars';
import { ReviewStats } from '@/hooks/useReviews';

interface RatingDistributionProps {
  stats: ReviewStats;
}

export function RatingDistribution({ stats }: RatingDistributionProps) {
  const maxCount = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="font-display text-4xl font-semibold">
          {stats.average_rating.toFixed(1)}
        </span>
        <div>
          <ReviewStars rating={Math.round(stats.average_rating)} />
          <p className="text-sm text-muted-foreground mt-1">
            {stats.review_count} {stats.review_count === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star as keyof typeof stats.distribution];
          const percentage = stats.review_count > 0 
            ? (count / stats.review_count) * 100 
            : 0;

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-muted-foreground">{star}</span>
              <ReviewStars rating={1} maxRating={1} size="sm" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}