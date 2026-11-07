import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Collections } from '@/components/home/Collections';
import { Features } from '@/components/home/Features';
import { ScentAnatomy } from '@/components/home/ScentAnatomy';
import { Manifesto } from '@/components/home/Manifesto';
import { Ritual } from '@/components/home/Ritual';
import { WornAndLoved } from '@/components/home/WornAndLoved';
import { Gifting } from '@/components/home/Gifting';
import { Marquee } from '@/components/brand/Marquee';

const notes = ['Saffron', 'Bergamot', 'Oud', 'Jasmine Sambac', 'Vetiver', 'Amber', 'Rose', 'Sandalwood', 'Pink Pepper', 'Musk'];

const Index = () => {
  return (
    <MainLayout>
      <SEOHead
        title="Luxury Fragrances"
        description="Discover Mystamoura's collection of luxury perfumes. Premium fragrances crafted with the finest ingredients for an unforgettable sensory experience."
      />
      <Hero />
      <div className="on-nuit border-y border-nuit-line py-5">
        <Marquee items={notes} />
      </div>
      <FeaturedProducts />
      <Collections />
      <ScentAnatomy />
      <Manifesto />
      <WornAndLoved />
      <Ritual />
      <Gifting />
      <Features />
    </MainLayout>
  );
};

export default Index;
