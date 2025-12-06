import { MainLayout } from '@/components/layout/MainLayout';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Collections } from '@/components/home/Collections';
import { Features } from '@/components/home/Features';

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <FeaturedProducts />
      <Collections />
    </MainLayout>
  );
};

export default Index;
