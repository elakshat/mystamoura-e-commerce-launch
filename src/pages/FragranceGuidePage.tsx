import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Flower2, TreePine, Flame, Wind, Sparkles } from 'lucide-react';

const fragranceFamilies = [
  {
    id: 'citrus',
    name: 'Citrus',
    icon: Droplets,
    color: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
    description: 'Fresh, zesty, and invigorating. Perfect for daytime wear and warm weather.',
    notes: ['Lemon', 'Bergamot', 'Orange', 'Grapefruit', 'Mandarin'],
    mood: 'Energetic, Fresh, Uplifting',
    occasions: ['Daily Wear', 'Office', 'Summer'],
  },
  {
    id: 'floral',
    name: 'Floral',
    icon: Flower2,
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
    description: 'Romantic, feminine, and timeless. The heart of classic perfumery.',
    notes: ['Rose', 'Jasmine', 'Lily', 'Peony', 'Tuberose'],
    mood: 'Romantic, Elegant, Classic',
    occasions: ['Date Night', 'Weddings', 'Spring'],
  },
  {
    id: 'woody',
    name: 'Woody',
    icon: TreePine,
    color: 'from-amber-500/20 to-brown-500/20',
    borderColor: 'border-amber-500/30',
    description: 'Rich, warm, and sophisticated. Exudes confidence and depth.',
    notes: ['Sandalwood', 'Cedar', 'Oud', 'Vetiver', 'Patchouli'],
    mood: 'Confident, Sophisticated, Grounded',
    occasions: ['Evening', 'Business', 'Fall/Winter'],
  },
  {
    id: 'oriental',
    name: 'Oriental',
    icon: Flame,
    color: 'from-red-500/20 to-amber-500/20',
    borderColor: 'border-red-500/30',
    description: 'Exotic, sensual, and mysterious. Rich spices and warm resins.',
    notes: ['Vanilla', 'Amber', 'Musk', 'Incense', 'Cinnamon'],
    mood: 'Sensual, Mysterious, Luxurious',
    occasions: ['Evening Events', 'Date Night', 'Special Occasions'],
  },
  {
    id: 'fresh',
    name: 'Fresh',
    icon: Wind,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    description: 'Clean, aquatic, and revitalizing. Reminiscent of ocean breeze.',
    notes: ['Sea Salt', 'Marine Notes', 'Cucumber', 'Green Tea', 'Mint'],
    mood: 'Clean, Refreshing, Modern',
    occasions: ['Sports', 'Beach', 'Casual'],
  },
  {
    id: 'spicy',
    name: 'Spicy',
    icon: Sparkles,
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
    description: 'Bold, warm, and captivating. Adds intrigue and allure.',
    notes: ['Black Pepper', 'Cardamom', 'Ginger', 'Clove', 'Saffron'],
    mood: 'Bold, Warm, Intriguing',
    occasions: ['Evening', 'Winter', 'Formal Events'],
  },
];

const notesPyramid = [
  {
    level: 'Top Notes',
    duration: '15-30 minutes',
    description: 'The first impression. Light, volatile notes that you smell immediately.',
    examples: ['Citrus', 'Light Fruits', 'Aromatic Herbs'],
  },
  {
    level: 'Middle Notes',
    duration: '2-4 hours',
    description: 'The heart of the fragrance. Emerges as top notes fade.',
    examples: ['Florals', 'Spices', 'Fruit Notes'],
  },
  {
    level: 'Base Notes',
    duration: '4-12+ hours',
    description: 'The foundation. Rich, deep notes that linger on skin.',
    examples: ['Woods', 'Musks', 'Amber', 'Vanilla'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FragranceGuidePage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gold))_0%,transparent_50%)] opacity-20"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-medium tracking-[0.3em] text-sm mb-4"
          >
            THE ART OF PERFUMERY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6"
          >
            Fragrance Notes & Families
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Discover the building blocks of perfumery and find the scent families that resonate with your personality.
          </motion.p>
        </div>
      </section>

      {/* Fragrance Pyramid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              The Fragrance Pyramid
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every perfume is composed of three layers that unfold over time
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {notesPyramid.map((note, index) => (
              <motion.div
                key={note.level}
                variants={itemVariants}
                className="relative"
                style={{ paddingLeft: `${index * 40}px`, paddingRight: `${index * 40}px` }}
              >
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-primary mb-1">
                        {note.level}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Lasts: {note.duration}
                      </p>
                      <p className="text-foreground/80">{note.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.examples.map((example) => (
                        <span
                          key={example}
                          className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Fragrance Families */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Fragrance Families
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the major scent categories and find your signature family
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {fragranceFamilies.map((family) => {
              const Icon = family.icon;
              return (
                <motion.div
                  key={family.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className={`relative bg-card border ${family.borderColor} rounded-2xl p-6 overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${family.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4"
                    >
                      <Icon className="h-7 w-7" />
                    </motion.div>
                    
                    <h3 className="font-display text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {family.name}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4">{family.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Key Notes</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {family.notes.map((note) => (
                            <span key={note} className="text-xs bg-secondary px-2 py-1 rounded">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Mood</span>
                        <p className="text-sm">{family.mood}</p>
                      </div>
                    </div>
                    
                    <Link
                      to={`/products?family=${family.id}`}
                      className="inline-flex items-center text-primary hover:underline text-sm font-medium group/link"
                    >
                      Explore {family.name} Fragrances
                      <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Ready to Find Your Signature Scent?
            </h2>
            <p className="text-muted-foreground mb-8">
              Explore our curated collection of luxury fragrances and discover the perfect match for your personality.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/products"
                className="inline-flex items-center bg-gradient-gold text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity group"
              >
                Shop All Fragrances
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
