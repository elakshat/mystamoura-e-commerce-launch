import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/brand/Reveal';
import { GiftBox } from '@/components/brand/GiftBox';
import { Ornament } from '@/components/brand/Ornament';

const points = [
  { title: 'The signature box', copy: 'Every bottle is placed in our gift box, wrapped securely for the journey.' },
  { title: 'Packaging, included', copy: 'Elegant packaging comes with every order. Nothing to add at checkout.' },
  { title: 'Across India', copy: 'We ship to all major cities and towns, carefully packaged to arrive perfect.' },
];

/** Gifting moment on the home page, built on the house's packaging promises. */
export function Gifting() {
  const boxRef = useRef<HTMLDivElement>(null);
  const boxInView = useInView(boxRef, { once: true, margin: '-20% 0px' });

  return (
    <section className="on-nuit grain relative overflow-hidden py-20 md:py-32" aria-labelledby="gifting-title">
      <div
        className="pointer-events-none absolute left-[8%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--brass) / 0.32), transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="container relative z-[2] mx-auto grid items-center gap-14 px-5 md:px-12 lg:grid-cols-2 lg:gap-24">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div ref={boxRef} className="relative flex aspect-square items-end justify-center">
            {/* pedestal */}
            <div className="absolute bottom-[14%] h-[10%] w-[78%] rounded-[50%] bg-[radial-gradient(ellipse,hsl(var(--brass)/0.35),transparent_70%)]" />
            <div className="absolute bottom-[16%] h-px w-[70%] bg-gradient-to-r from-transparent via-[hsl(var(--brass-light)/0.8)] to-transparent" />
            <GiftBox className="relative mb-[15%] w-[72%]" lidOpen={boxInView} delay={0.4} />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Ornament className="mb-8 justify-start" />
            <p className="eyebrow mb-5 text-brass-light">The Gift of Scent</p>
            <h2 id="gifting-title" className="display-lg max-w-lg">
              Wrapped as it <em className="font-light">deserves</em>
            </h2>
            <p className="lede mt-6 max-w-md text-nuit-muted">
              Every order leaves our studio in the Myst Amoura signature gift box — ready to give, or to keep.
            </p>
          </Reveal>

          <dl className="mt-12 divide-y divide-nuit-line border-y border-nuit-line">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
                <dt className="font-display text-xl">{p.title}</dt>
                <dd className="text-sm leading-relaxed text-nuit-muted">{p.copy}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2} className="mt-12">
            <Link to="/products" className="btn-maison">
              Choose a gift <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
