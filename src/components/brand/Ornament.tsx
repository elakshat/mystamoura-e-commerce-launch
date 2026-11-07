import { cn } from '@/lib/utils';

/** Engraved divider: hairlines either side of a small brass fleuron. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-4 text-brass', className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-current md:w-20" />
      <svg viewBox="0 0 40 16" className="h-4 w-10" fill="none" stroke="currentColor" strokeWidth="0.9">
        <path d="M20 2 C23 6 23 10 20 14 C17 10 17 6 20 2Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M18 8 C13 3 7 4 4 8 C7 12 13 13 18 8Z" />
        <path d="M22 8 C27 3 33 4 36 8 C33 12 27 13 22 8Z" />
        <circle cx="1.5" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="38.5" cy="8" r="1" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-current md:w-20" />
    </div>
  );
}
