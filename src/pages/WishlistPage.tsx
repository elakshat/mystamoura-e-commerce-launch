import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHero } from '@/components/brand/PageHero';
import { ProductCard } from '@/components/products/ProductCard';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { user } = useAuth();
  const { data: wishlistItems, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  if (!user) {
    return (
      <MainLayout>
        <section className="grain bg-background">
          <div className="container relative z-[2] mx-auto px-5 py-28 text-center md:px-12 md:py-40">
            <p className="eyebrow mb-6 text-brass">Wishlist</p>
            <h1 className="display-lg">Keep what you <em className="font-light">love</em></h1>
            <p className="lede mx-auto mt-6 max-w-md text-muted-foreground">Sign in to view your saved items</p>
            <Link to="/auth" className="btn-maison mt-10">Sign in <ArrowRight /></Link>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHero
        eyebrow="Wishlist"
        title={<>Your <em className="font-light">saved</em> scents</>}
        aside={<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{wishlistItems?.length || 0} saved items</p>}
      />

      <div className="container mx-auto px-5 py-12 md:px-12 md:py-20">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="product-card-media bg-secondary" />
                <div className="h-4 w-3/4 bg-secondary" />
              </div>
            ))}
          </div>
        ) : wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-16">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <ProductCard product={item.product} index={index} />
                <button
                  type="button"
                  className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--nuit-foreground))] text-[hsl(var(--nuit))] opacity-100 transition-opacity hover:bg-destructive hover:text-white md:opacity-0 md:group-hover:opacity-100"
                  onClick={() => removeFromWishlist.mutate(item.product.id)}
                  aria-label={`Remove ${item.product.name} from wishlist`}
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-y py-24 text-center">
            <h2 className="font-display text-4xl font-light italic">Your wishlist is empty</h2>
            <p className="mt-4 text-muted-foreground">Save your favorite products to view them later</p>
            <Link to="/products" className="btn-maison mt-10">Start shopping <ArrowRight /></Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
