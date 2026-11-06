import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { Reveal } from '@/components/brand/Reveal';
import { cn } from '@/lib/utils';

export function Collections() {
  const { data: categories } = useCategories();

  return (
    <section className="grain bg-background py-20 md:py-32" aria-labelledby="home-collections-title">
      <div className="container relative z-[2] mx-auto px-5 md:px-12">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <p className="eyebrow mb-5 text-brass">No. 02 — The Collections</p>
          <h2 id="home-collections-title" className="display-lg text-balance">
            Choose your <em className="font-light">character</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {categories?.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.12} className={cn(i === 1 && 'lg:mt-24')}>
              <Link to={`/collections/${category.slug}`} className="group block">
                <div className="arch relative aspect-[3/4] bg-secondary">
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1400ms] ease-silk group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--nuit)/0.55)] via-transparent to-transparent" />
                  <span className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={1.2} />
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-display text-lg italic text-brass">0{i + 1}</span>
                  <h3 className="font-display text-[34px] font-light leading-none md:text-[40px]">{category.name}</h3>
                </div>
                {category.description && (
                  <p className="mt-3 max-w-sm pl-9 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
