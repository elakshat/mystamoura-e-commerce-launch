import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/brand/Reveal';
import { useCategories } from '@/hooks/useProducts';

const steps = [
  {
    title: 'Find the pulse',
    copy: 'Spray on warm points — wrists, the base of the throat, behind the ears. Warmth carries the scent outward.',
  },
  {
    title: 'Never rub',
    copy: 'Let it settle on its own. Rubbing your wrists together crushes the top notes before they can open.',
  },
  {
    title: 'Mist the fabric',
    copy: 'One light spray on a scarf or collar keeps the trail around you long after the skin has warmed through.',
  },
];

/** A short wearing guide, split around the hero still-life image. */
export function Ritual() {
  const { data: categories } = useCategories();
  const withImages = categories?.filter((c) => c.image_url) ?? [];
  const image = withImages[withImages.length - 1]?.image_url || '/images/home-hero-still-life.webp';

  return (
    <section className="grain bg-background py-20 md:py-32" aria-labelledby="ritual-title">
      <div className="container relative z-[2] mx-auto grid items-center gap-14 px-5 md:px-12 lg:grid-cols-2 lg:gap-24">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={image}
              alt="Wearing Myst Amoura"
              loading="lazy"
              className="h-full w-full object-cover object-[60%_center]"
            />
          </div>
          <div className="absolute -right-3 -top-3 hidden h-full w-full border border-brass/50 md:block" aria-hidden="true" />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow mb-5 text-brass">No. 04 — The Ritual</p>
            <h2 id="ritual-title" className="display-lg text-balance">
              How to <em className="font-light">wear</em> it
            </h2>
          </Reveal>

          <ol className="mt-12 space-y-10">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.1} className="grid grid-cols-[56px_1fr] gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground font-display text-lg">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[28px] leading-tight">{step.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{step.copy}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.3} className="mt-12">
            <Link to="/products" className="btn-maison">
              Find your scent <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
