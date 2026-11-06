import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  tone?: 'paper' | 'nuit';
  className?: string;
}

/** Editorial page opener shared by catalogue, account and content pages. */
export function PageHero({ eyebrow, title, description, aside, tone = 'paper', className }: PageHeroProps) {
  return (
    <section
      className={cn(
        'grain border-b',
        tone === 'nuit' ? 'on-nuit' : 'bg-background',
        className
      )}
    >
      <div className="container relative z-[2] mx-auto px-5 pb-12 pt-14 md:px-12 md:pb-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-end gap-8 md:grid-cols-[1fr_auto]"
        >
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-5 text-brass">{eyebrow}</p>}
            <h1 className="display-lg text-balance">{title}</h1>
            {description && (
              <div className="lede mt-6 max-w-xl text-muted-foreground">{description}</div>
            )}
          </div>
          {aside && <div className="md:pb-2">{aside}</div>}
        </motion.div>
      </div>
    </section>
  );
}
