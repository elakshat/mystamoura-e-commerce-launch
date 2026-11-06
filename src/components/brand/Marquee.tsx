import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
}

/** Endless ticker of words separated by a small brass star. */
export function Marquee({ items, className }: MarqueeProps) {
  const row = [...items, ...items];

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="px-8 font-display text-[22px] italic font-light md:text-[28px]">{item}</span>
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-brass" fill="currentColor">
              <path d="M6 0 7.2 4.8 12 6 7.2 7.2 6 12 4.8 7.2 0 6 4.8 4.8Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
