import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reveal } from '@/components/brand/Reveal';

interface HomeReview {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  product: { name: string; slug: string; images: string[] } | null;
}

/** Latest approved customer reviews, read live — the section hides itself if there aren't enough. */
function useHomeReviews() {
  return useQuery({
    queryKey: ['home-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, title, content, product:products(name, slug, images)')
        .eq('is_approved', true)
        .eq('is_spam', false)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      // Prefer reviews that say something specific over one-word ones.
      return ((data ?? []) as unknown as HomeReview[])
        .filter((r) => r.product && (r.content?.trim().length ?? 0) >= 14)
        .slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="foil text-sm tracking-[0.2em]" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="opacity-30">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

export function WornAndLoved() {
  const { data: reviews } = useHomeReviews();
  if (!reviews || reviews.length < 2) return null;

  return (
    <section className="grain bg-secondary py-20 md:py-32" aria-labelledby="reviews-title">
      <div className="container relative z-[2] mx-auto px-5 md:px-12">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
          <div>
            <p className="eyebrow mb-5 text-brass">In their words</p>
            <h2 id="reviews-title" className="display-lg">
              Worn <em className="font-light">&amp; loved</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Notes left by people wearing Myst Amoura, shown as written.
          </p>
        </Reveal>

        <div className="grid gap-px bg-border md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.1} className="bg-secondary">
              <figure className="flex h-full flex-col py-10 md:px-10 md:py-6">
                <Stars rating={r.rating} />
                <blockquote className="mt-6 flex-1 font-display text-[28px] font-light italic leading-[1.2] md:text-[32px]">
                  “{r.content.trim()}”
                </blockquote>
                {r.product && (
                  <figcaption className="mt-8">
                    <Link to={`/products/${r.product.slug}`} className="group flex items-center gap-4">
                      {r.product.images?.[0] && (
                        <span className="h-14 w-10 shrink-0 overflow-hidden rounded-t-full bg-nuit">
                          <img src={r.product.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
                        </span>
                      )}
                      <span>
                        <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">On</span>
                        <span className="font-display text-lg uppercase tracking-[0.06em] group-hover:text-brass">{r.product.name}</span>
                      </span>
                    </Link>
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
