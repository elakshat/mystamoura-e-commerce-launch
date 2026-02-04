import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, ArrowLeft, Share2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { ReviewStars } from '@/components/reviews/ReviewStars';
import { useIsInWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useReviewStats } from '@/hooks/useReviews';
import { StickyAddToCart } from '@/components/products/StickyAddToCart';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts } = useProducts({ categorySlug: product?.category?.slug });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  
  const { data: isInWishlist } = useIsInWishlist(product?.id || '');
  const { toggle: toggleWishlist, isPending: wishlistPending } = useToggleWishlist();
  const { data: reviewStats } = useReviewStats(product?.id || '');

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

  // Share functionality
  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isSoldOut = product.stock <= 0;
  const currentPrice = isOnSale ? product.sale_price! : product.price;

  const handleAddToCart = () => {
    if (!isSoldOut) {
      addToCart(product, quantity);
    }
  };

  const filteredRelated = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <MainLayout>
      <Helmet>
        <title>{product.name} | Mystamoura</title>
        <meta name="description" content={product.description || `Buy ${product.name} - Premium fragrance from Mystamoura`} />
        <meta property="og:title" content={`${product.name} | Mystamoura`} />
        <meta property="og:description" content={product.description || ''} />
        {product.images?.[0] && <meta property="og:image" content={product.images[0]} />}
      </Helmet>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary relative">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              
              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 md:space-y-6"
          >
            {product.category && (
              <Link
                to={`/collections/${product.category.slug}`}
                className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider hover:underline"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating Summary */}
            {reviewStats && reviewStats.review_count > 0 && (
              <div className="flex items-center gap-2">
                <ReviewStars rating={Math.round(reviewStats.average_rating)} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {reviewStats.average_rating} ({reviewStats.review_count} reviews)
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {isOnSale ? (
                <>
                  <span className="text-xl md:text-2xl font-semibold text-primary">
                    {formatPrice(product.sale_price!, product.currency)}
                  </span>
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="bg-primary/20 text-primary text-xs md:text-sm font-bold px-2 py-1 rounded">
                    SAVE {Math.round((1 - product.sale_price! / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-xl md:text-2xl font-semibold">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>

            {product.size && (
              <p className="text-muted-foreground text-sm md:text-base">{product.size}</p>
            )}

            {product.description && (
              <p className="text-foreground leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            )}

            {product.notes && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-sm md:text-base">Fragrance Notes</h3>
                <p className="text-sm text-muted-foreground">{product.notes}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div ref={addToCartRef} className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90 h-12 md:h-14"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`h-12 md:h-14 px-4 border-border hover:bg-secondary ${isInWishlist ? 'text-primary' : ''}`}
                  onClick={() => user && toggleWishlist(product.id, isInWishlist || false)}
                  disabled={!user || wishlistPending}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-primary' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span>100% authentic product guarantee</span>
              </div>
            </div>

            {product.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </p>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {filteredRelated && filteredRelated.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="font-display text-xl md:text-3xl font-bold mb-6 md:mb-8 text-foreground">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {filteredRelated.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>

      {/* Sticky Add to Cart for Mobile */}
      <StickyAddToCart
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isVisible={showStickyCart}
      />
    </MainLayout>
  );
}
