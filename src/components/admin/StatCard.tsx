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
  default: 'glass-card',
  gold: 'glass-card',
  success: 'glass-card',
  warning: 'glass-card',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  gold: 'bg-muted text-foreground',
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
      className={cn(
        'admin-stat relative overflow-hidden rounded-sm p-6',
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
            className="admin-stat-value mt-2 text-3xl font-medium font-sans"
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

    </motion.div>
  );
}
