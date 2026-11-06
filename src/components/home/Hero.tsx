import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { WaxSeal } from '@/components/brand/WaxSeal';

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { data: settings } = useSettings();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 800], [0, reduced ? 0 : 90]);

  const lead = settings?.hero?.title || 'Perfumes born in India';
  const subtitle = settings?.hero?.subtitle || 'Handcrafted perfumes that leave a lasting impression.';

  return (
    <section className="grain relative overflow-hidden bg-background" aria-labelledby="home-hero-title">
      {/* drifting mist — warm haze that slowly moves behind the bottle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mist mist-a" />
        <div className="mist mist-b" />
        <div className="mist mist-c" />
      </div>

      {/* faint vertical rules */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <div className="container mx-auto grid h-full grid-cols-4 px-12">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-l border-border/60 last:border-r" />)}
        </div>
      </div>

      <div className="container relative z-[2] mx-auto grid min-h-[calc(100svh-76px)] items-center gap-12 px-5 pb-16 pt-10 md:px-12 lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-6">
        {/* Copy */}
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="eyebrow mb-8 flex items-center gap-4 text-brass"
          >
            <span className="h-px w-10 bg-current" /> Maison de Parfum
          </motion.p>

          <h1 id="home-hero-title" className="display-xl">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease, delay: 0.05 }}
            >
              Myst
            </motion.span>
            <motion.span
              className="block pl-[0.55em] italic"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease, delay: 0.18 }}
            >
              Amoura
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.4 }}
            className="mt-10 grid max-w-xl gap-8 md:grid-cols-[auto_1fr] md:items-start"
          >
            <span className="hidden h-px w-16 translate-y-4 bg-foreground md:block" />
            <div>
              <p className="font-display text-[28px] leading-tight md:text-[34px]">{lead}</p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link to={settings?.hero?.cta_link || '/products'} className="btn-maison">
                  {settings?.hero?.cta_text || 'Shop Now'} <ArrowRight />
                </Link>
                <Link to="/about" className="link-line">Our story</Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.1 }}
          className="relative mx-auto w-full max-w-[460px] lg:col-span-5 lg:max-w-none"
        >
          <div className="arch-outline">
            <div className="arch relative aspect-[4/5.4] bg-secondary">
              <motion.img
                style={{ y: imageY }}
                src="/images/home-hero-still-life.webp"
                alt="Amber perfume bottle arranged with limestone and a flower petal"
                loading="eager"
                className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover object-[72%_center]"
              />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 1.25, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.9, ease, delay: 0.9 }}
            className="absolute -bottom-10 -left-1 md:-left-14"
          >
            <WaxSeal ring="Eau de Parfum · Made in India ·" className="h-28 w-28 md:h-36 md:w-36" />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground lg:flex">
        <span className="eyebrow text-[9px]">Scroll</span>
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.3} />
      </div>
    </section>
  );
}
