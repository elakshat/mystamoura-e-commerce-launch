import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { motion, useReducedMotion } from 'framer-motion';

export function Hero() {
  const { data: settings } = useSettings();
  const title = settings?.hero?.title || 'Perfumes born in India';
  const reducedMotion = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: reducedMotion ? false as const : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__inner container mx-auto">
        <div className="home-hero__copy">
          <motion.h1 {...entrance(0.05)} id="home-hero-title" className="home-hero__title font-display">{title.replace(/in India$/, 'in\u00a0India')}</motion.h1>
          <motion.p {...entrance(0.15)} className="home-hero__description">{settings?.hero?.subtitle || 'Handcrafted perfumes that leave a lasting impression.'}</motion.p>
          <motion.div {...entrance(0.25)} className="home-hero__actions">
            <Button asChild size="lg" className="home-hero__button group">
              <Link to={settings?.hero?.cta_link || '/products'}>
                {settings?.hero?.cta_text || 'Shop Now'}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link to="/about" className="home-hero__story">Our Story</Link>
          </motion.div>
        </div>
        <motion.div {...entrance(0.1)} className="home-hero__media">
          <img
            src="/images/home-hero-still-life.webp"
            alt="Amber perfume bottle arranged with limestone and a flower petal"
            loading="eager"
            fetchPriority="high"
            className="home-hero__image"
          />
        </motion.div>
      </div>
    </section>
  );
}
