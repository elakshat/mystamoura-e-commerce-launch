import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

export function Collections() {
  const { data: categories } = useCategories();

  return (
    <section className="border-t border-border bg-secondary/30 py-14 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-8 md:mb-10">
          <p className="mb-3 text-xs text-primary font-medium">EXPLORE</p>
          <h2 className="font-display text-3xl md:text-5xl font-normal">Our Collections</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {categories?.map((category) => (
            <Link key={category.id} to={`/collections/${category.slug}`} className="group block min-w-0">
              <div className="collection-image overflow-hidden rounded-md bg-muted">
                {category.image_url && <img src={category.image_url} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-medium">{category.name}</h3>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" strokeWidth={1.5} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
