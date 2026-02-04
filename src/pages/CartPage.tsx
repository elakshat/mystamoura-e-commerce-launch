import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Tag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useTaxSettings, calculateTax, calculateShipping, calculateTotal } from '@/hooks/useTaxSettings';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { Coupon } from '@/types';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { data: taxSettings, isLoading: taxLoading } = useTaxSettings();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const validateCoupon = useValidateCoupon();

  const shippingSettings = taxSettings?.shipping || { base_price: 99, free_threshold: 1500 };
  const taxRate = taxSettings?.tax?.rate || 18;
  const shippingAmount = calculateShipping(subtotal, shippingSettings);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = calculateTax(taxableAmount, taxRate);
  const total = calculateTotal(subtotal, discountAmount, shippingAmount, taxAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const coupon = await validateCoupon.mutateAsync({
        code: couponCode,
        orderAmount: subtotal,
      });
      setAppliedCoupon(coupon);
      toast.success('Coupon applied successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <SEOHead title="Cart" description="View your shopping cart at Mystamoura" />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild className="bg-gradient-gold text-primary-foreground">
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEOHead title="Cart" description="View and manage your shopping cart at Mystamoura" />
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8 text-foreground">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 bg-card rounded-lg border border-border"
              >
                <Link
                  to={`/products/${item.product.slug}`}
                  className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-secondary"
                >
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-display text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.product.size}</p>
                  <p className="font-semibold mt-1">
                    {formatPrice(
                      item.product.sale_price || item.product.price,
                      item.product.currency
                    )}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-lg p-6 sticky top-24"
            >
              <h2 className="font-display text-xl font-bold mb-6 text-foreground">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={validateCoupon.isPending}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingAmount === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      formatPrice(shippingAmount)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {shippingAmount > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Add {formatPrice(shippingSettings.free_threshold - subtotal)} more for free shipping
                </p>
              )}

              <Button
                className="w-full mt-6 bg-gradient-gold text-primary-foreground hover:opacity-90 py-6"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
