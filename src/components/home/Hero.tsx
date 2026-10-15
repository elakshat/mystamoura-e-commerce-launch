import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useProducts';

export function Hero() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const image = categories?.find((category) => category.slug === 'unisex')?.image_url
    || categories?.find((category) => category.image_url)?.image_url;

  return (
    <section className="hero-editorial relative isolate flex items-end md:items-center overflow-hidden bg-secondary">
      {image && <img src={image} alt="Myst Amoura fragrances" fetchPriority="high" className="hero-image absolute inset-0 h-full w-full object-cover" />}
      <div className="hero-shade absolute inset-0" aria-hidden="true" />
      <div className="hero-copy container relative mx-auto px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-lg space-y-6 md:space-y-8">
          <p className="text-xs font-medium">LUXURY FRAGRANCES · MADE IN INDIA</p>
          <h1 className="font-display text-5xl md:text-7xl font-normal leading-none">Myst Amoura</h1>
          <div className="space-y-3 max-w-sm">
            <p className="text-xl md:text-2xl font-display">{settings?.hero?.title || 'Perfumes born in India'}</p>
            <p className="hero-subtitle text-sm leading-relaxed">{settings?.hero?.subtitle || 'Handcrafted perfumes that leave a lasting impression.'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Button asChild size="lg" className="group">
              <Link to={settings?.hero?.cta_link || '/products'}>{settings?.hero?.cta_text || 'Shop Now'}<ArrowRight className="transition-transform group-hover:translate-x-1" /></Link>
            </Button>
            <Link to="/about" className="hero-story inline-flex items-center py-2 text-sm">Our Story</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
