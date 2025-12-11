import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import { Json } from '@/integrations/supabase/types';

const addressSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  country: z.string().default('India'),
});

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingSettings = settings?.shipping || { base_price: 99, free_threshold: 1500 };
  const taxSettings = settings?.tax || { rate: 18 };
  const shippingAmount = subtotal >= shippingSettings.free_threshold ? 0 : shippingSettings.base_price;
  const taxAmount = (subtotal * taxSettings.rate) / 100;
  const total = subtotal + shippingAmount + taxAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedAddress = addressSchema.parse(formData);

      if (!user && !formData.email) {
        setErrors({ email: 'Email is required for guest checkout' });
        return;
      }

      const orderNumber = generateOrderNumber();

      await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          guest_email: !user ? formData.email : null,
          subtotal,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount,
          total,
          shipping_address: validatedAddress as unknown as Json,
          payment_method: 'cod',
        },
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.images?.[0] || null,
          quantity: item.quantity,
          unit_price: item.product.sale_price || item.product.price,
          total_price: (item.product.sale_price || item.product.price) * item.quantity,
        })),
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-success', { state: { orderNumber } });
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
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} className={errors.full_name ? 'border-destructive' : ''} />
                    {errors.full_name && <p className="text-destructive text-sm mt-1">{errors.full_name}</p>}
                  </div>
                  {!user && (
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                  )}
                  <div className="md:col-span-2"><Label htmlFor="phone">Phone *</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'border-destructive' : ''} />{errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}</div>
                  <div className="md:col-span-2"><Label htmlFor="address_line1">Address *</Label><Input id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleChange} className={errors.address_line1 ? 'border-destructive' : ''} />{errors.address_line1 && <p className="text-destructive text-sm mt-1">{errors.address_line1}</p>}</div>
                  <div className="md:col-span-2"><Label htmlFor="address_line2">Address Line 2</Label><Input id="address_line2" name="address_line2" value={formData.address_line2} onChange={handleChange} /></div>
                  <div><Label htmlFor="city">City *</Label><Input id="city" name="city" value={formData.city} onChange={handleChange} className={errors.city ? 'border-destructive' : ''} />{errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}</div>
                  <div><Label htmlFor="state">State *</Label><Input id="state" name="state" value={formData.state} onChange={handleChange} className={errors.state ? 'border-destructive' : ''} />{errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}</div>
                  <div><Label htmlFor="postal_code">Postal Code *</Label><Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleChange} className={errors.postal_code ? 'border-destructive' : ''} />{errors.postal_code && <p className="text-destructive text-sm mt-1">{errors.postal_code}</p>}</div>
                  <div><Label htmlFor="country">Country</Label><Input id="country" name="country" value={formData.country} disabled /></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-display text-xl font-semibold mb-4">Payment Method</h2>
                <div className="bg-secondary/50 p-4 rounded-lg"><p className="font-medium">Cash on Delivery</p><p className="text-sm text-muted-foreground">Pay when your order arrives</p></div>
              </motion.div>
            </div>
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">{items.map((item) => (<div key={item.product.id} className="flex gap-3"><div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">{item.product.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />}</div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.product.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p><p className="text-sm font-semibold">{formatPrice((item.product.sale_price || item.product.price) * item.quantity)}</p></div></div>))}</div>
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingAmount === 0 ? <span className="text-primary">FREE</span> : formatPrice(shippingAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(taxAmount)}</span></div>
                  <div className="border-t border-border pt-3"><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div></div>
                </div>
                <Button type="submit" className="w-full mt-6 bg-gradient-gold text-primary-foreground hover:opacity-90 py-6" disabled={createOrder.isPending}>{createOrder.isPending ? 'Placing Order...' : 'Place Order'}</Button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
