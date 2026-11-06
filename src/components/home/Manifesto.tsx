import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Reveal } from '@/components/brand/Reveal';
import { Monogram } from '@/components/brand/Monogram';

/** Full-bleed brand statement, using the hero subtitle from site settings. */
export function Manifesto() {
  const { data: settings } = useSettings();
  const line = settings?.hero?.subtitle || 'Handcrafted perfumes that leave a lasting impression.';

  return (
    <section className="on-nuit grain relative overflow-hidden py-24 md:py-40" aria-label="Our philosophy">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--brass) / 0.35), transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="container relative z-[2] mx-auto px-5 text-center md:px-12">
        <Reveal>
          <Monogram className="mx-auto h-16 w-16 text-2xl text-brass-light" />
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="mx-auto mt-10 max-w-4xl font-display text-[clamp(34px,5vw,72px)] font-light italic leading-[1.05] tracking-[-0.02em] text-balance">
            “{line}”
          </blockquote>
        </Reveal>
        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <Link to="/about" className="btn-ghost-maison">
            Read our story <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
