import { Reveal } from '@/components/brand/Reveal';

const tiers = [
  {
    name: 'Top notes',
    time: 'The first 15 minutes',
    copy: 'The bright opening — citrus, herbs and spice that greet you the moment you spray, then gently fade.',
  },
  {
    name: 'Heart notes',
    time: 'Hours one to four',
    copy: 'The soul of the perfume. Florals, fruits and warm spices bloom once the opening settles.',
  },
  {
    name: 'Base notes',
    time: 'Into the evening',
    copy: 'Woods, resins, musk and amber — the deep trail that stays on skin and lingers on fabric.',
  },
];

/** Editorial explainer of how a fragrance unfolds over time. */
export function ScentAnatomy() {
  return (
    <section className="grain bg-secondary py-20 md:py-32" aria-labelledby="anatomy-title">
      <div className="container relative z-[2] mx-auto grid gap-14 px-5 md:px-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow mb-5 text-brass">No. 03 — The Craft</p>
          <h2 id="anatomy-title" className="display-lg text-balance">
            Anatomy of a <em className="font-light">scent</em>
          </h2>
          <p className="lede mt-6 max-w-sm text-muted-foreground">
            Every Myst Amoura perfume is built in three movements, so it changes with you through the day.
          </p>
        </Reveal>

        <div className="lg:col-span-7 lg:col-start-6">
          {/* pyramid glyph */}
          <Reveal className="mb-10 hidden md:block">
            <svg viewBox="0 0 600 120" className="h-auto w-full text-foreground" fill="none" stroke="currentColor" strokeWidth="0.75" aria-hidden="true">
              <path d="M300 6 L594 114 L6 114 Z" />
              <path d="M202 42 L398 42" />
              <path d="M104 78 L496 78" />
              <circle cx="300" cy="6" r="3" fill="currentColor" />
            </svg>
          </Reveal>

          <ol className="border-t border-foreground/80">
            {tiers.map((tier, i) => (
              <Reveal as="li" key={tier.name} delay={i * 0.1} className="grid gap-3 border-b py-8 md:grid-cols-[80px_1fr_1.4fr] md:gap-8 md:py-10">
                <span className="foil pr-1 font-display text-5xl font-light italic leading-none">{`0${i + 1}`}</span>
                <div>
                  <h3 className="font-display text-[32px] leading-none">{tier.name}</h3>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{tier.time}</p>
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{tier.copy}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
