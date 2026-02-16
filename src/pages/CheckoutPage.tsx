import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, Loader2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTaxSettings, calculateTax, calculateShipping, calculateTotal } from '@/hooks/useTaxSettings';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const addressSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone number is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode is required'),
  country: z.string().default('India'),
});

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { data: taxSettings } = useTaxSettings();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  // Sync email when user logs in after page load
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check for payment error from URL
  useEffect(() => {
    const paymentError = searchParams.get('error');
    if (paymentError === 'payment_failed') {
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams]);

  const shippingSettings = taxSettings?.shipping || { base_price: 99, free_threshold: 1500 };
  const taxRate = taxSettings?.tax?.rate || 18;
  const shippingAmount = calculateShipping(subtotal, shippingSettings);
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, 0, shippingAmount, taxAmount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const sendOrderEmails = async (orderNumber: string, validatedAddress: any) => {
    try {
      await supabase.functions.invoke('send-order-emails', {
        body: {
          order_number: orderNumber,
          customer_email: formData.email || user?.email,
          customer_name: formData.full_name,
          total,
          items: items.map((item) => {
            const unitPrice = item.variant
              ? (item.variant.sale_price && item.variant.sale_price < item.variant.price ? item.variant.sale_price : item.variant.price)
              : (item.product.sale_price || item.product.price);
            return {
              product_name: item.product.name + (item.variant ? ` - ${item.variant.size}` : ''),
              quantity: item.quantity,
              unit_price: unitPrice,
            };
          }),
          shipping_address: validatedAddress,
        },
      });
    } catch (error) {
      console.error('Failed to send order emails:', error);
    }
  };

  const initiateRazorpayPayment = useCallback(async (orderNumber: string, validatedAddress: any) => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      setIsProcessing(false);
      return;
    }

    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          orderNumber,
          amount: total,
          notes: {
            order_number: orderNumber,
            customer_email: formData.email || user?.email,
          },
        },
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to create payment order');
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Mystamoura',
        description: `Order ${orderNumber}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResult = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_number: orderNumber,
              },
            });

            if (verifyResult.error || !verifyResult.data.success) {
              throw new Error(verifyResult.data?.error || 'Payment verification failed');
            }

            // Send order confirmation emails
            await sendOrderEmails(orderNumber, validatedAddress);

            clearCart();
            toast.success('Payment successful! Order placed.');
            navigate('/order-success', { 
              state: { 
                orderNumber,
                paymentId: response.razorpay_payment_id,
              } 
            });
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/checkout?error=payment_failed&order=${orderNumber}`);
          }
        },
        prefill: {
          name: formData.full_name,
          email: formData.email || user?.email,
          contact: formData.phone,
        },
        notes: {
          order_number: orderNumber,
        },
        theme: {
          color: '#D4AF37',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  }, [razorpayLoaded, total, formData, user, clearCart, navigate, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isProcessing || createOrder.isPending) {
      return;
    }

    setIsProcessing(true);

    try {
      const validatedAddress = addressSchema.parse(formData);

      if (!formData.email) {
        setErrors({ email: 'Email is required for order confirmation' });
        setIsProcessing(false);
        return;
      }

      const orderNumber = generateOrderNumber();

      // Create order first
      await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          guest_email: formData.email,
          subtotal,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount,
          total,
          shipping_address: validatedAddress as unknown as Json,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'awaiting',
        },
        items: items.map((item) => {
          const unitPrice = item.variant
            ? (item.variant.sale_price && item.variant.sale_price < item.variant.price ? item.variant.sale_price : item.variant.price)
            : (item.product.sale_price || item.product.price);
          return {
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.images?.[0] || null,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * item.quantity,
            variant_id: item.variant?.id || null,
            variant_size: item.variant?.size || null,
            variant_sku: item.variant?.sku || null,
          };
        }),
      });

      if (paymentMethod === 'razorpay') {
        // Initiate Razorpay payment
        await initiateRazorpayPayment(orderNumber, validatedAddress);
      } else {
        // Cash on Delivery
        await sendOrderEmails(orderNumber, validatedAddress);
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-success', { state: { orderNumber } });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <MainLayout>
      <SEOHead title="Checkout" description="Complete your order at Mystamoura" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8 text-foreground">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-display text-xl font-semibold mb-6 text-foreground">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="full_name" className="text-foreground">Full Name *</Label>
                    <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} className={errors.full_name ? 'border-destructive' : ''} />
                    {errors.full_name && <p className="text-destructive text-sm mt-1">{errors.full_name}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email" className="text-foreground">Email * <span className="text-xs text-muted-foreground font-normal">(for order confirmation)</span></Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} placeholder="your@email.com" />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone" className="text-foreground">Phone *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'border-destructive' : ''} />
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address_line1" className="text-foreground">Address *</Label>
                    <Input id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleChange} className={errors.address_line1 ? 'border-destructive' : ''} />
                    {errors.address_line1 && <p className="text-destructive text-sm mt-1">{errors.address_line1}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address_line2" className="text-foreground">Address Line 2</Label>
                    <Input id="address_line2" name="address_line2" value={formData.address_line2} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-foreground">City *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} className={errors.city ? 'border-destructive' : ''} />
                    {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-foreground">State *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} className={errors.state ? 'border-destructive' : ''} />
                    {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="postal_code" className="text-foreground">Postal Code *</Label>
                    <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} className={errors.postal_code ? 'border-destructive' : ''} />
                    {errors.postal_code && <p className="text-destructive text-sm mt-1">{errors.postal_code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-foreground">Country</Label>
                    <Input id="country" name="country" value={formData.country} disabled className="bg-muted" />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-display text-xl font-semibold mb-4 text-foreground">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cod' | 'razorpay')} className="space-y-3">
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}>
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Pay Online (Razorpay)</p>
                        <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking, Wallets</p>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-6 text-foreground">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const unitPrice = item.variant
                      ? (item.variant.sale_price && item.variant.sale_price < item.variant.price ? item.variant.sale_price : item.variant.price)
                      : (item.product.sale_price || item.product.price);
                    return (
                    <div key={`${item.product.id}_${item.variant?.id || 'base'}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">{item.product.name}</p>
                        {item.variant && <p className="text-xs text-primary font-medium">{item.variant.size}</p>}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-foreground">{formatPrice(unitPrice * item.quantity)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{shippingAmount === 0 ? <span className="text-primary">FREE</span> : formatPrice(shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                    <span className="text-foreground">{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatPrice(Math.round(total * 100) / 100)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-gradient-gold text-primary-foreground hover:opacity-90 py-6" 
                  disabled={createOrder.isPending || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : createOrder.isPending ? (
                    'Placing Order...'
                  ) : paymentMethod === 'razorpay' ? (
                    'Pay Now'
                  ) : (
                    'Place Order'
                  )}
                </Button>
                {paymentMethod === 'razorpay' && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Secure payment powered by Razorpay
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
