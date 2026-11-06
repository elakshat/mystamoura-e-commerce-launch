import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft, ArrowRight, Tag, X, Lock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useTaxSettings, calculateTax, calculateShipping, calculateTotal } from '@/hooks/useTaxSettings';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { Coupon, CartItem } from '@/types';
import { toast } from 'sonner';
import { loadAppliedCoupon, saveAppliedCoupon, calculateDiscount } from '@/lib/coupon';

function getItemPrice(item: CartItem): number {
  if (item.variant) {
    return item.variant.sale_price && item.variant.sale_price < item.variant.price
      ? item.variant.sale_price
      : item.variant.price;
  }
  return item.product.sale_price && item.product.sale_price < item.product.price
    ? item.product.sale_price
    : item.product.price;
}

function getItemStock(item: CartItem): number {
  return item.variant ? item.variant.stock : item.product.stock;
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { data: taxSettings, isLoading: taxLoading } = useTaxSettings();
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCouponState] = useState<Coupon | null>(() => loadAppliedCoupon());
  const [couponCode, setCouponCode] = useState(() => loadAppliedCoupon()?.code || '');
  const setAppliedCoupon = (c: Coupon | null) => {
    setAppliedCouponState(c);
    saveAppliedCoupon(c);
  };
  const validateCoupon = useValidateCoupon();

  const shippingSettings = taxSettings?.shipping || { base_price: 99, free_threshold: 1500 };
  const taxRate = taxSettings?.tax?.rate || 18;
  const shippingAmount = calculateShipping(subtotal, shippingSettings);
  
  const discountAmount = calculateDiscount(appliedCoupon, subtotal);

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

  const freeShippingProgress = Math.min(100, (subtotal / (shippingSettings.free_threshold || 1)) * 100);

  if (items.length === 0) {
    return (
      <MainLayout>
        <SEOHead title="Cart" description="View your shopping cart at Mystamoura" />
        <section className="grain bg-background">
          <div className="container relative z-[2] mx-auto px-5 py-28 text-center md:px-12 md:py-40">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
              <p className="eyebrow mb-6 text-brass">Your bag</p>
              <h1 className="display-lg">Empty, <em className="font-light">for now.</em></h1>
              <p className="lede mx-auto mt-6 max-w-md text-muted-foreground">
                Looks like you haven't added any items to your bag yet.
              </p>
              <Link to="/products" className="btn-maison mt-10">
                Explore the collection <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEOHead title="Cart" description="View and manage your shopping cart at Mystamoura" />
      <div className="container mx-auto px-5 pb-20 pt-10 md:px-12 md:pb-28 md:pt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-8 md:mb-14">
          <div>
            <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Continue shopping
            </Link>
            <h1 className="display-lg">Your <em className="font-light">bag</em></h1>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {(() => { const n = items.reduce((t, i) => t + i.quantity, 0); return `${n} ${n === 1 ? 'item' : 'items'}`; })()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <ul className="lg:col-span-7">
            {items.map((item, index) => {
              const price = getItemPrice(item);
              const stock = getItemStock(item);
              const variantId = item.variant?.id;

              return (
                <motion.li
                  key={`${item.product.id}_${variantId || 'base'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-5 border-b py-6 first:pt-0 md:gap-8 md:py-8"
                >
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="aspect-[5/7] w-24 flex-shrink-0 overflow-hidden bg-nuit md:w-32"
                  >
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-display text-[22px] uppercase leading-tight tracking-[0.05em] hover:text-brass md:text-[26px]"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Eau de Parfum · {item.variant ? item.variant.size : item.product.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, variantId)}
                        className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <X className="h-4 w-4" strokeWidth={1.4} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                      <div className="flex h-10 items-center border border-foreground/25">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, variantId)}
                          className="flex h-full w-9 items-center justify-center hover:bg-secondary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="tabular w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, variantId)}
                          className="flex h-full w-9 items-center justify-center hover:bg-secondary disabled:opacity-30"
                          disabled={item.quantity >= stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="tabular font-display text-2xl">{formatPrice(price * item.quantity, item.product.currency)}</p>
                        {item.quantity > 1 && (
                          <p className="tabular text-xs text-muted-foreground">{formatPrice(price, item.product.currency)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grain bg-secondary p-6 md:p-10 lg:sticky lg:top-28"
            >
              <div className="relative z-[2]">
                <h2 className="font-display text-3xl">Summary</h2>

                {/* Free shipping meter */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground">
                    {shippingAmount > 0
                      ? <>Add <span className="font-medium text-foreground">{formatPrice(shippingSettings.free_threshold - subtotal)}</span> more for free shipping</>
                      : 'You’ve unlocked complimentary shipping.'}
                  </p>
                  <div className="mt-3 h-px w-full bg-foreground/15">
                    <motion.div
                      className="h-px bg-foreground"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingAmount > 0 ? freeShippingProgress : 100}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between border border-dashed border-foreground/40 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-brass" strokeWidth={1.4} />
                        <span className="text-sm font-medium tracking-[0.12em]">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex border-b border-foreground/30 focus-within:border-foreground">
                      <Input
                        placeholder="Promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="h-12 flex-1 border-0 bg-transparent px-0 tracking-[0.12em] focus-visible:ring-0"
                        aria-label="Promo code"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validateCoupon.isPending}
                        className="label-caps px-2 text-[11px] hover:text-brass disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular">{formatPrice(subtotal)}</dd>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-brass">
                      <dt>Discount</dt>
                      <dd className="tabular">-{formatPrice(discountAmount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="tabular">{shippingAmount === 0 ? 'Free' : formatPrice(shippingAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tax ({taxRate}%)</dt>
                    <dd className="tabular">{formatPrice(taxAmount)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-foreground/20 pt-5">
                    <dt className="label-caps text-[11px]">Total</dt>
                    <dd className="tabular font-display text-3xl">{formatPrice(total)}</dd>
                  </div>
                </dl>

                <button type="button" className="btn-maison mt-8 w-full" onClick={() => navigate('/checkout')}>
                  Proceed to checkout <ArrowRight />
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Secure checkout
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
