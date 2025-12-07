import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  variant?: 'default' | 'gold' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card border-border',
  gold: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
  success: 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20',
  warning: 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  gold: 'bg-primary/20 text-primary',
  success: 'bg-green-500/20 text-green-500',
  warning: 'bg-orange-500/20 text-orange-500',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  index = 0,
  variant = 'default',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-shadow duration-300 hover:shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            className="mt-2 text-3xl font-bold font-display"
          >
            {value}
          </motion.p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% from last period
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </motion.div>
  );
}
