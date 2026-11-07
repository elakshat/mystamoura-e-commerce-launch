import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelProps {
  eyebrow?: string;
  title: string;
  action?: { to: string; label: string };
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Shared card frame for dashboard sections: eyebrow, serif title, optional link. */
export function Panel({ eyebrow, title, action, aside, className, children }: PanelProps) {
  return (
    <section className={cn('rounded-sm border border-border bg-card', className)}>
      <header className="flex items-end justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
        <div className="min-w-0">
          {eyebrow && <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-brass">{eyebrow}</p>}
          <h2 className="mt-1 font-display text-[22px] leading-tight">{title}</h2>
        </div>
        {aside}
        {action && (
          <Link
            to={action.to}
            className="group flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {action.label}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

/** Quiet empty state used inside panels. */
export function PanelEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-8 text-center">
      <p className="font-display text-lg italic text-muted-foreground">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
