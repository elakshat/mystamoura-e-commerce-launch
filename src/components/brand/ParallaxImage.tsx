import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** How far the image drifts, as a % of the frame height. */
  strength?: number;
  loading?: 'lazy' | 'eager';
}

/**
 * Fills its (relative, overflow-hidden) parent. The picture is slightly taller than the
 * frame and drifts against the scroll, giving quiet depth. Static for reduced motion.
 */
export function ParallaxImage({ src, alt, className, imgClassName, strength = 8, loading = 'lazy' }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className="absolute inset-x-0"
        style={{ y: reduced ? 0 : y, top: `-${strength}%`, bottom: `-${strength}%` }}
      >
        <img src={src} alt={alt} loading={loading} className={cn('h-full w-full object-cover', imgClassName)} />
      </motion.div>
    </div>
  );
}
