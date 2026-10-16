import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

export function Hero() {
  const { data: settings } = useSettings();

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <img
        src="/images/home-hero-still-life.webp"
        alt="Amber perfume bottle arranged with limestone and a flower petal"
        loading="eager"
        className="home-hero__image"
      />
      <div className="home-hero__inner container mx-auto">
        <div className="home-hero__copy">
          <h1 id="home-hero-title" className="home-hero__title font-display">Myst Amoura</h1>
          <p className="home-hero__lead font-display">{settings?.hero?.title || 'Perfumes born in India'}</p>
          <p className="home-hero__description">{settings?.hero?.subtitle || 'Handcrafted perfumes that leave a lasting impression.'}</p>
          <div className="home-hero__actions">
            <Button asChild size="lg" className="home-hero__button group bg-[#92764f] text-white hover:bg-[#776142]">
              <Link to={settings?.hero?.cta_link || '/products'}>
                {settings?.hero?.cta_text || 'Shop Now'}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link to="/about" className="home-hero__story">Our Story</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
