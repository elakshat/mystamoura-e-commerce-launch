import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Collections } from '@/components/home/Collections';
import { Features } from '@/components/home/Features';

const Index = () => {
  return (
    <MainLayout>
      <SEOHead 
        title="Luxury Fragrances" 
        description="Discover Mystamoura's collection of luxury perfumes. Premium fragrances crafted with the finest ingredients for an unforgettable sensory experience."
      />
      <Hero />
      <Features />
      <FeaturedProducts />
      <Collections />
    </MainLayout>
  );
};

export default Index;
