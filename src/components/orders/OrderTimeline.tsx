import { motion } from 'framer-motion';
import { Package, Truck, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
  { status: 'processing', label: 'Being Packed', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: MapPin },
];

const cancelledStatuses: OrderStatus[] = ['cancelled', 'refunded'];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, string>>;
}

export function OrderTimeline({ currentStatus, timestamps = {} }: OrderTimelineProps) {
  const isCancelled = cancelledStatuses.includes(currentStatus);
  const currentStepIndex = statusSteps.findIndex((s) => s.status === currentStatus);

  if (isCancelled) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4"
        >
          <XCircle className="h-8 w-8 text-destructive" />
        </motion.div>
        <h3 className="font-display text-xl font-semibold text-destructive">
          Order {currentStatus === 'refunded' ? 'Refunded' : 'Cancelled'}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          This order has been {currentStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute left-6 top-0 w-0.5 bg-primary"
          style={{ maxHeight: 'calc(100% - 2rem)' }}
        />

        {/* Steps */}
        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 pl-2"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <StepIcon className="h-5 w-5" />
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full bg-primary/30"
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4
                    className={cn(
                      'font-medium',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </h4>
                  {timestamps[step.status] && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(timestamps[step.status]).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {isCurrent && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-block mt-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                    >
                      Current Status
                    </motion.span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
