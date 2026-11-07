import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CurtainProps {
  className?: string;
  delay?: number;
}

/**
 * Place inside a `relative overflow-hidden` image frame. A panel in the page colour
 * covers the image and lifts away the first time the frame scrolls into view.
 */
export function Curtain({ className, delay = 0 }: CurtainProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 z-10 origin-top bg-background', className)}
      initial={{ scaleY: 1 }}
      whileInView={{ scaleY: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.3, delay, ease: [0.76, 0, 0.24, 1] }}
    />
  );
}
