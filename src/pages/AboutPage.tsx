import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Reveal } from '@/components/brand/Reveal';
import { WaxSeal } from '@/components/brand/WaxSeal';
import { Marquee } from '@/components/brand/Marquee';
import { useSettings } from '@/hooks/useSettings';

const ease = [0.22, 1, 0.36, 1] as const;

const pillars = [
  {
    title: 'Our Philosophy',
    copy: "We believe that fragrance is more than just a scent—it's an experience, a memory, a statement. Each of our perfumes is carefully crafted using the finest ingredients sourced from around the world, blended by master perfumers with decades of expertise.",
  },
  {
    title: 'Craftsmanship',
    copy: 'Every bottle of Mystamoura represents hours of meticulous work—from selecting the perfect combination of notes to the elegant packaging that houses each fragrance. We take pride in our attention to detail and commitment to quality.',
  },
  {
    title: 'Our Promise',
    copy: 'We promise to deliver authentic, premium fragrances that exceed your expectations. Your satisfaction is our priority, and we stand behind every product we create.',
  },
];

export default function AboutPage() {
  const { data: settings } = useSettings();
  const story =
    settings?.footer?.about_text ||
    'Mystamoura was born from a passion for creating exceptional fragrances that capture the essence of elegance and individuality. Our journey began with a simple belief: everyone deserves a signature scent that tells their unique story.';
  const paragraphs = story.split(/\n+/).filter(Boolean);

  return (
    <MainLayout>
      <SEOHead
        title="About Us"
        description="Learn about Mystamoura's journey, philosophy, and commitment to creating exceptional luxury fragrances."
      />

      {/* Opening */}
      <section className="grain overflow-hidden bg-background">
        <div className="container relative z-[2] mx-auto grid items-center gap-12 px-5 py-16 md:px-12 md:py-24 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="lg:col-span-7"
          >
            <p className="eyebrow mb-8 flex items-center gap-4 text-brass">
              <span className="h-px w-10 bg-current" /> Our Story
            </p>
            <h1 className="display-xl">
              A house <br />
              of <em className="font-light">scent,</em>
              <br />
              <span className="pl-[0.8em]">born in India</span>
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, ease, delay: 0.1 }}
            className="mx-auto w-full max-w-sm lg:col-span-4 lg:col-start-9"
          >
            <div className="arch-outline">
              <div className="arch aspect-[3/4.2] bg-secondary">
                <img
                  src="/images/home-hero-still-life.webp"
                  alt="Amber perfume bottle arranged with limestone"
                  className="h-full w-full object-cover object-[75%_center]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="on-nuit border-y border-nuit-line py-5">
        <Marquee items={['Composed with care', 'Born in India', 'Worn with emotion', 'Made to linger']} />
      </div>

      {/* Letter */}
      <section className="grain bg-secondary py-20 md:py-32">
        <div className="container relative z-[2] mx-auto grid gap-12 px-5 md:px-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow text-brass">A note from the house</p>
          </Reveal>
          <Reveal delay={0.1} className="paper-stack lg:col-span-8 lg:col-start-5">
           <div className="paper-sheet px-6 py-10 md:px-14 md:py-16">
            <div className="space-y-6 font-display text-[21px] leading-[1.6] md:text-[25px] [&>p:first-child]:text-[30px] [&>p:first-child]:leading-[1.25] [&>p:first-child]:text-foreground md:[&>p:first-child]:text-[36px]">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-12 flex items-center gap-5 border-t border-dashed border-foreground/20 pt-8">
              <WaxSeal className="h-16 w-16 shrink-0 -rotate-12 md:h-20 md:w-20" />
              <div>
                <p className="font-display text-2xl italic">Myst Amoura</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Maison de Parfum · India</p>
              </div>
            </div>
           </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="grain border-t bg-background py-20 md:py-32">
        <div className="container relative z-[2] mx-auto px-5 md:px-12">
          <Reveal className="mb-14 md:mb-20">
            <h2 className="display-lg max-w-2xl">What we <em className="font-light">stand for</em></h2>
          </Reveal>
          <div className="grid gap-px bg-foreground/15 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.1} className="bg-background p-0 py-8 md:px-10 md:py-4 md:first:pl-0">
                <span className="foil pr-1 font-display text-6xl font-light italic">0{i + 1}</span>
                <h3 className="mt-6 font-display text-[32px] leading-tight">{pillar.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{pillar.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="on-nuit grain py-24 text-center md:py-36">
        <div className="container relative z-[2] mx-auto px-5 md:px-12">
          <Reveal>
            <p className="eyebrow mb-6 text-brass-light">Begin here</p>
            <h2 className="display-lg mx-auto max-w-3xl text-balance">
              Find the scent that <em className="font-light">feels like you</em>
            </h2>
            <Link to="/products" className="btn-maison mt-12">
              Explore the collection <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>
    </MainLayout>
  );
}
