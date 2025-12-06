import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts } = useProducts({ categorySlug: product?.category?.slug });
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
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
            className="space-y-6"
          >
            {product.category && (
              <Link
                to={`/collections/${product.category.slug}`}
                className="text-sm text-primary font-medium uppercase tracking-wider hover:underline"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-semibold">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              {isOnSale ? (
                <>
                  <span className="text-2xl font-semibold text-primary">
                    {formatPrice(product.sale_price!, product.currency)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="bg-primary/20 text-primary text-sm font-bold px-2 py-1 rounded">
                    SAVE {Math.round((1 - product.sale_price! / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>

            {product.size && (
              <p className="text-muted-foreground">{product.size}</p>
            )}

            {product.description && (
              <p className="text-foreground/80 leading-relaxed">
                {product.description}
              </p>
            )}

            {product.notes && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Fragrance Notes</h3>
                <p className="text-sm text-muted-foreground">{product.notes}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4">
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

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90 py-6"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="py-6 border-border hover:bg-secondary"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free shipping on orders above ₹1500</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
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
          <section className="mt-20">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filteredRelated.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
