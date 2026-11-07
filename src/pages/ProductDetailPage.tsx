import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, ArrowLeft, Share2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useProductVariants } from '@/hooks/useVariants';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { ReviewStars } from '@/components/reviews/ReviewStars';
import { useIsInWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useReviewStats } from '@/hooks/useReviews';
import { StickyAddToCart } from '@/components/products/StickyAddToCart';
import { VariantSelector } from '@/components/products/VariantSelector';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { ProductVariantInfo } from '@/types';
import { trackViewItem } from '@/lib/gtag';
import { trackPixelEvent } from '@/utils/metaPixel';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: variants } = useProductVariants(product?.id || '');
  const { data: relatedProducts } = useProducts({ categorySlug: product?.category?.slug });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantInfo | null>(null);
  const addToCartRef = useRef<HTMLDivElement>(null);
  
  const { data: isInWishlist } = useIsInWishlist(product?.id || '');
  const { toggle: toggleWishlist, isPending: wishlistPending } = useToggleWishlist();
  const { data: reviewStats } = useReviewStats(product?.id || '');

  // Visible variants only
  const visibleVariants = (variants || []).filter(v => v.is_visible);

  // Auto-select default variant
  useEffect(() => {
    if (visibleVariants.length > 0 && !selectedVariant) {
      const defaultVariant = visibleVariants.find(v => v.is_default) || visibleVariants[0];
      setSelectedVariant(defaultVariant as ProductVariantInfo);
    }
  }, [variants]);

  // Reset variant when product changes
  useEffect(() => {
    setSelectedVariant(null);
    setQuantity(1);
    // Track view_item
    if (product) {
      trackViewItem({
        id: product.id,
        name: product.name,
        price: product.sale_price && product.sale_price < product.price ? product.sale_price : product.price,
        currency: product.currency,
      });
      trackPixelEvent('ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.sale_price && product.sale_price < product.price ? product.sale_price : product.price,
        currency: product.currency || 'INR',
      });
    }
  }, [product?.id]);

  const hasVariants = visibleVariants.length > 0;
  
  // Derive price/stock from selected variant or product
  const currentPrice = hasVariants && selectedVariant
    ? (selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.price ? selectedVariant.sale_price : selectedVariant.price)
    : (product?.sale_price && product.sale_price < product.price ? product.sale_price : product?.price || 0);
  
  const originalPrice = hasVariants && selectedVariant ? selectedVariant.price : product?.price || 0;
  const isOnSale = hasVariants && selectedVariant
    ? (selectedVariant.sale_price !== null && selectedVariant.sale_price !== undefined && selectedVariant.sale_price < selectedVariant.price)
    : (product?.sale_price !== null && product?.sale_price !== undefined && product!.sale_price! < product!.price);
  
  const currentStock = hasVariants && selectedVariant ? selectedVariant.stock : (product?.stock || 0);
  const isSoldOut = currentStock <= 0;
  const currentSku = hasVariants && selectedVariant ? selectedVariant.sku : product?.sku;

  // Handle sticky cart visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCart(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current);
    }

    return () => observer.disconnect();
  }, [product]);

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-10 md:px-12">
          <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="aspect-[5/7] bg-secondary lg:col-span-6" />
            <div className="space-y-5 lg:col-span-6">
              <div className="h-3 w-1/4 bg-secondary" />
              <div className="h-12 w-3/4 bg-secondary" />
              <div className="h-8 w-1/3 bg-secondary" />
              <div className="h-14 bg-secondary" />
              <div className="h-32 bg-secondary" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-28 text-center md:px-12">
          <p className="eyebrow mb-5 text-brass">Not found</p>
          <h1 className="display-md mb-8">This fragrance has <em className="font-light">drifted away</em></h1>
          <Link to="/products" className="btn-maison">
            Back to the collection
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a size before adding to cart');
      return;
    }
    if (!isSoldOut) {
      addToCart(product, quantity, hasVariants ? selectedVariant : null);
    }
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant as ProductVariantInfo);
    setQuantity(1);
  };

  const filteredRelated = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 4);

  const splitNotes = (text: string) => text.split(/[,\n•|]+/).map((n) => n.trim().replace(/[.;]$/, '')).filter(Boolean);
  const noteList = product.notes ? splitNotes(product.notes) : [];

  // "Top Notes: a, b Heart Notes: c Base Notes: d" → tiers for the pyramid view
  const noteTiers: { label: string; notes: string[] }[] = [];
  if (product.notes) {
    const tierRe = /\b(top|heart|middle|base)(?:\s*notes?)?\s*[:–-]/gi;
    const matches = [...product.notes.matchAll(tierRe)];
    matches.forEach((m, i) => {
      const start = (m.index ?? 0) + m[0].length;
      const end = matches[i + 1]?.index ?? product.notes!.length;
      const label = m[1].toLowerCase() === 'middle' ? 'Heart' : m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
      noteTiers.push({ label, notes: splitNotes(product.notes!.slice(start, end)) });
    });
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{product.name} | Mystamoura</title>
        <meta name="description" content={product.description || `Buy ${product.name} - Premium fragrance from Mystamoura`} />
        <meta property="og:title" content={`${product.name} | Mystamoura`} />
        <meta property="og:description" content={product.description || ''} />
        {product.images?.[0] && <meta property="og:image" content={product.images[0]} />}
      </Helmet>

      <div className="container mx-auto px-5 pb-16 pt-6 md:px-12 md:pb-24 md:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:mb-10">
          <Link to="/products" className="inline-flex items-center gap-2 hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Shop
          </Link>
          {product.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/collections/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
              {product.images && product.images.length > 1 && (
                <div className="scrollbar-hide flex gap-2 overflow-x-auto md:w-20 md:flex-col md:gap-3 md:overflow-visible">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Show image ${index + 1}`}
                      className={`relative aspect-[5/7] w-16 flex-shrink-0 overflow-hidden bg-nuit transition-opacity md:w-full ${
                        selectedImage === index ? 'opacity-100 ring-1 ring-foreground ring-offset-2 ring-offset-background' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div
                className="zoom-frame relative flex-1 overflow-hidden bg-nuit"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
                  e.currentTarget.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
                }}
              >
                <AnimatePresence mode="wait">
                  {product.images?.[selectedImage] ? (
                    <motion.img
                      key={selectedImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="aspect-[5/7] h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex aspect-[5/7] w-full items-center justify-center bg-secondary font-display text-xl italic text-muted-foreground">
                      Image coming soon
                    </div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleShare}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--nuit)/0.4)] text-[hsl(var(--nuit-foreground))] backdrop-blur-md transition-colors hover:bg-[hsl(var(--nuit-foreground))] hover:text-[hsl(var(--nuit))]"
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4" strokeWidth={1.4} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 lg:pl-6 xl:pl-12"
          >
            <div className="lg:sticky lg:top-28">
              {product.category && (
                <Link to={`/collections/${product.category.slug}`} className="eyebrow text-brass hover:text-foreground">
                  {product.category.name}
                </Link>
              )}

              <h1 className="mt-4 font-display text-[44px] font-light uppercase leading-[0.95] tracking-[0.04em] md:text-[60px]">
                {product.name}
              </h1>

              <p className="mt-3 font-display text-lg italic text-muted-foreground">
                Eau de Parfum{!hasVariants && product.size ? ` · ${product.size}` : ''}
              </p>

              {reviewStats && reviewStats.review_count > 0 && (
                <a href="#reviews" className="mt-4 flex items-center gap-2">
                  <ReviewStars rating={Math.round(reviewStats.average_rating)} size="sm" />
                  <span className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                    {reviewStats.average_rating} · {reviewStats.review_count} reviews
                  </span>
                </a>
              )}

              {/* Price */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVariant?.id || 'default'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="mt-8 flex flex-wrap items-baseline gap-3 border-b pb-8"
                >
                  <span className="tabular font-display text-4xl">
                    {formatPrice(currentPrice, product.currency)}
                  </span>
                  {isOnSale && (
                    <>
                      <span className="tabular text-lg text-muted-foreground line-through">
                        {formatPrice(originalPrice, product.currency)}
                      </span>
                      <span className="bg-foreground px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-background">
                        Save {Math.round((1 - currentPrice / originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                  <span className="w-full text-xs text-muted-foreground">Inclusive of all taxes</span>
                </motion.div>
              </AnimatePresence>

              {hasVariants && (
                <div className="mt-8">
                  <VariantSelector
                    variants={visibleVariants as any}
                    selectedVariant={selectedVariant as any}
                    onSelect={handleVariantSelect}
                  />
                </div>
              )}

              {/* Quantity & Add to Bag */}
              <div ref={addToCartRef} className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="label-caps text-[11px] text-muted-foreground">Quantity</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentStock}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground"
                    >
                      {currentStock > 0 ? (currentStock <= 5 ? `Only ${currentStock} left` : 'In stock') : 'Out of stock'}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-[52px] items-center border border-foreground/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-full w-11 items-center justify-center hover:bg-secondary disabled:opacity-30"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="tabular w-8 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="flex h-full w-11 items-center justify-center hover:bg-secondary disabled:opacity-30"
                      disabled={quantity >= currentStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button type="button" className="btn-maison flex-1" onClick={handleAddToCart} disabled={isSoldOut}>
                    <ShoppingBag className="!translate-x-0" strokeWidth={1.4} />
                    {isSoldOut ? 'Sold Out' : 'Add to Bag'}
                  </button>

                  <button
                    type="button"
                    className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center border transition-colors ${
                      isInWishlist ? 'border-foreground bg-foreground text-background' : 'border-foreground/30 hover:border-foreground'
                    }`}
                    onClick={() => {
                      if (!user) {
                        toast.info('Please sign in to save items to your wishlist', {
                          action: { label: 'Sign In', onClick: () => window.location.assign('/auth') },
                        });
                        return;
                      }
                      toggleWishlist(product.id, isInWishlist || false);
                    }}
                    disabled={wishlistPending}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} strokeWidth={1.4} />
                  </button>
                </div>
              </div>

              {/* Assurances */}
              <div className="mt-8 grid grid-cols-2 gap-px bg-border">
                <div className="flex items-center gap-3 bg-background py-4 pr-3">
                  <Truck className="h-5 w-5 shrink-0 text-brass" strokeWidth={1} />
                  <span className="text-xs leading-snug text-muted-foreground">Free shipping on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-3 bg-background py-4 pl-4">
                  <Shield className="h-5 w-5 shrink-0 text-brass" strokeWidth={1} />
                  <span className="text-xs leading-snug text-muted-foreground">100% authentic product guarantee</span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-8 border-t">
                {product.description && (
                  <details className="group border-b" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 label-caps text-[11px] [&::-webkit-details-marker]:hidden">
                      The Story
                      <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="product-description pb-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>
                  </details>
                )}

                {noteList.length > 0 && (
                  <details className="group border-b" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 label-caps text-[11px] [&::-webkit-details-marker]:hidden">
                      Fragrance Notes
                      <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    {noteTiers.length > 0 ? (
                      <dl className="pb-6">
                        {noteTiers.map((tier) => (
                          <div key={tier.label} className="grid grid-cols-[72px_1fr] items-baseline gap-4 border-t border-dashed py-3 first:border-t-0 first:pt-0">
                            <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-brass">{tier.label}</dt>
                            <dd className="font-display text-[19px] italic leading-snug">{tier.notes.join(' · ')}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <div className="flex flex-wrap gap-2 pb-6">
                        {noteList.map((note) => (
                          <span key={note} className="rounded-full border px-4 py-1.5 font-display text-[17px] italic">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </details>
                )}

                <details className="group border-b">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-5 label-caps text-[11px] [&::-webkit-details-marker]:hidden">
                    Shipping & Returns
                    <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <div className="space-y-2 pb-6 text-sm leading-relaxed text-muted-foreground">
                    <p>Orders are processed within 1–2 business days and shipped across India in our signature gift box.</p>
                    <p>
                      Read our <Link to="/shipping" className="underline underline-offset-4 hover:text-foreground">shipping</Link> and{' '}
                      <Link to="/refund" className="underline underline-offset-4 hover:text-foreground">refund</Link> policies.
                    </p>
                  </div>
                </details>
              </div>

              {currentSku && (
                <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  SKU · {currentSku}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {filteredRelated && filteredRelated.length > 0 && (
          <section className="mt-24 md:mt-32">
            <div className="mb-10 flex items-end justify-between gap-6 border-b pb-6 md:mb-14">
              <div>
                <p className="eyebrow mb-3 text-brass">You may also like</p>
                <h2 className="display-md">From the same <em className="font-light">family</em></h2>
              </div>
              {product.category && (
                <Link to={`/collections/${product.category.slug}`} className="link-line hidden sm:inline-flex">View collection</Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {filteredRelated.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <div id="reviews" className="scroll-mt-28">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Sticky Add to Cart for Mobile */}
      <StickyAddToCart
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isVisible={showStickyCart}
        variant={selectedVariant}
      />
    </MainLayout>
  );
}
