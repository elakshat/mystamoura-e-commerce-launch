import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  variant?: 'default' | 'gold' | 'success' | 'warning';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  index = 0,
  variant = 'default',
}: StatCardProps) {
  const attention = variant === 'warning';
  const feature = variant === 'gold';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'admin-stat relative overflow-hidden rounded-sm border p-6',
        feature ? 'on-nuit grain border-transparent' : 'bg-card',
        !feature && (attention ? 'border-[hsl(36_60%_78%)]' : 'border-border')
      )}
    >
      <div className="relative z-[2] flex items-start justify-between gap-3">
        <p className={cn('text-[10px] font-medium uppercase tracking-[0.22em]', feature ? 'text-brass-light' : 'text-muted-foreground')}>
          {title}
        </p>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
            feature
              ? 'border-[hsl(var(--brass-light)/0.4)] text-brass-light'
              : attention
                ? 'border-[hsl(36_60%_78%)] bg-[hsl(38_78%_94%)] text-[hsl(30_70%_32%)]'
                : 'border-border text-muted-foreground'
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.4} />
        </span>
      </div>
      <p className="admin-stat-value tabular relative z-[2] mt-4 font-display text-[40px] font-light leading-none">{value}</p>
      {(hint || trend) && (
        <p className={cn('relative z-[2] mt-3 text-xs', feature ? 'text-nuit-muted' : 'text-muted-foreground')}>
          {trend && (
            <span className={trend.isPositive ? 'text-[hsl(145_35%_30%)]' : 'text-destructive'}>
              {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value).toFixed(0)}%{' '}
            </span>
          )}
          {hint}
        </p>
      )}
      {attention && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[hsl(36_70%_60%)]" />}
    </motion.div>
  );
}
