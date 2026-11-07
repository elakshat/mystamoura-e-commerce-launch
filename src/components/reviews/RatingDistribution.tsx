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
        <span className="tabular font-display text-6xl font-light leading-none">
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
              <span className="tabular w-3 text-xs text-muted-foreground">{star}</span>
              <ReviewStars rating={1} maxRating={1} size="sm" />
              <div className="h-[3px] flex-1 overflow-hidden bg-foreground/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                  className="h-full bg-foreground"
                />
              </div>
              <span className="tabular w-8 text-right text-xs text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}