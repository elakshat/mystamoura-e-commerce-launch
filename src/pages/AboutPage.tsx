import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';

export default function AboutPage() {
  return (
    <MainLayout>
      <SEOHead 
        title="About Us" 
        description="Learn about Mystamoura's journey, philosophy, and commitment to creating exceptional luxury fragrances."
      />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <p className="text-primary font-medium tracking-[0.2em] text-sm mb-3">
              OUR STORY
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              About Mystamoura
            </h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Mystamoura was born from a passion for creating exceptional fragrances that capture 
              the essence of elegance and individuality. Our journey began with a simple belief: 
              everyone deserves a signature scent that tells their unique story.
            </p>

            <h2 className="font-display text-2xl font-semibold mt-12 mb-4">Our Philosophy</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We believe that fragrance is more than just a scent—it's an experience, a memory, 
              a statement. Each of our perfumes is carefully crafted using the finest ingredients 
              sourced from around the world, blended by master perfumers with decades of expertise.
            </p>

            <h2 className="font-display text-2xl font-semibold mt-12 mb-4">Craftsmanship</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every bottle of Mystamoura represents hours of meticulous work—from selecting the 
              perfect combination of notes to the elegant packaging that houses each fragrance. 
              We take pride in our attention to detail and commitment to quality.
            </p>

            <h2 className="font-display text-2xl font-semibold mt-12 mb-4">Our Promise</h2>
            <p className="text-muted-foreground leading-relaxed">
              We promise to deliver authentic, premium fragrances that exceed your expectations. 
              Your satisfaction is our priority, and we stand behind every product we create.
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
