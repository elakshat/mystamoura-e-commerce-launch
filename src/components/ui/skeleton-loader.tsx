import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'table' | 'text' | 'avatar' | 'image';
  count?: number;
}

export function SkeletonLoader({
  className,
  variant = 'text',
  count = 1,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={cn('grid gap-4', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            <div className="aspect-[3/4] bg-muted animate-shimmer bg-[length:200%_100%] bg-gold-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer w-3/4" />
              <div className="h-3 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer w-1/2" />
              <div className="h-5 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Header */}
        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer flex-1"
            />
          ))}
        </div>
        {/* Rows */}
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-border/30">
            {[1, 2, 3, 4].map((col) => (
              <div
                key={col}
                className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer flex-1"
                style={{ animationDelay: `${(i + col) * 0.1}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn('flex gap-3', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-muted animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
          />
        ))}
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div className={cn('', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted rounded-lg animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
        <div className="absolute inset-0 bg-muted animate-shimmer bg-[length:200%_100%] bg-gold-shimmer" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 animate-shimmer bg-[length:200%_100%] bg-gold-shimmer" />
        <div className="h-3 bg-muted rounded w-1/2 animate-shimmer bg-[length:200%_100%] bg-gold-shimmer" />
        <div className="h-5 bg-muted rounded w-1/3 animate-shimmer bg-[length:200%_100%] bg-gold-shimmer" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/30">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div
            className="h-4 bg-muted rounded animate-shimmer bg-[length:200%_100%] bg-gold-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        </td>
      ))}
    </tr>
  );
}
