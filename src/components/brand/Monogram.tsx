import { cn } from '@/lib/utils';

/** The "MA" house monogram, set in the display serif inside a thin ring. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex aspect-square items-center justify-center rounded-full border border-current font-display font-normal leading-none',
        className
      )}
      aria-hidden="true"
    >
      <span className="translate-y-[1px] tracking-[-0.06em]">MA</span>
    </span>
  );
}
