import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GiftBoxProps {
  className?: string;
  /** Lift the lid (animated). */
  lidOpen?: boolean;
  delay?: number;
}

/** The signature gift box: ribboned in brass, its lid lifting as the order is confirmed. */
export function GiftBox({ className, lidOpen = true, delay = 0.5 }: GiftBoxProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 140 130" className={cn('drop-shadow-[0_14px_18px_rgba(40,25,15,0.18)]', className)} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3ece0" />
          <stop offset="100%" stopColor="#dccfba" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
          <stop offset="18%" stopColor="#000" stopOpacity="0" />
          <stop offset="82%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7d5f35" />
          <stop offset="35%" stopColor="#d8b67a" />
          <stop offset="55%" stopColor="#a8854f" />
          <stop offset="100%" stopColor="#6e5230" />
        </linearGradient>
      </defs>

      {/* base */}
      <rect x="28" y="62" width="84" height="58" fill={`url(#${id}-box)`} />
      <rect x="28" y="62" width="84" height="58" fill={`url(#${id}-side)`} />
      <rect x="64" y="62" width="12" height="58" fill={`url(#${id}-brass)`} />
      <rect x="28" y="62" width="84" height="5" fill="#000" fillOpacity="0.1" />

      {/* lid + bow lift together */}
      <motion.g
        initial={{ y: 0, rotate: 0 }}
        animate={lidOpen ? { y: -12, rotate: -5 } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: '24px', originY: '62px' }}
      >
        <rect x="22" y="46" width="96" height="18" fill={`url(#${id}-box)`} />
        <rect x="22" y="46" width="96" height="18" fill={`url(#${id}-side)`} />
        <rect x="22" y="62" width="96" height="2" fill="#000" fillOpacity="0.12" />
        <rect x="64" y="46" width="12" height="18" fill={`url(#${id}-brass)`} />
        <path d="M70 46 C58 30 40 30 44 40 C47 47 60 47 70 46Z" fill={`url(#${id}-brass)`} />
        <path d="M70 46 C82 30 100 30 96 40 C93 47 80 47 70 46Z" fill={`url(#${id}-brass)`} />
        <path d="M68 46 L60 56 M72 46 L80 56" stroke={`url(#${id}-brass)`} strokeWidth="4" strokeLinecap="round" />
        <circle cx="70" cy="45" r="4.5" fill={`url(#${id}-brass)`} />
      </motion.g>
    </svg>
  );
}
