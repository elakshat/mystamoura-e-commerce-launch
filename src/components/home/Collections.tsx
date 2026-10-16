import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

export function Collections() {
  const { data: categories } = useCategories();

  return (
    <section className="home-collections border-t border-border py-16 md:py-24" aria-labelledby="home-collections-title">
      <div className="container mx-auto px-6 md:px-12">
        <div className="home-section-heading mb-10 md:mb-14">
          <h2 id="home-collections-title" className="font-display text-3xl md:text-5xl font-normal">Our Collections</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {categories?.map((category) => (
            <Link key={category.id} to={`/collections/${category.slug}`} className="group block min-w-0">
              <div className="collection-image relative overflow-hidden bg-muted">
                {category.image_url && <img src={category.image_url} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />}
                <div className="collection-shade absolute inset-0" aria-hidden="true" />
                <div className="collection-caption absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-6 md:p-8">
                  <h3 className="font-display text-3xl font-normal">{category.name}</h3>
                  <ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
