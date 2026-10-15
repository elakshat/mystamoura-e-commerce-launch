import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Smooth, fluid page transition wrapper.
 * Keyed by pathname so it animates on every route change.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.25,
        ease: [0.22, 1, 0.36, 1], // expo-out: silky, premium feel
      }}
    >
      {children}
    </motion.div>
  );
}
