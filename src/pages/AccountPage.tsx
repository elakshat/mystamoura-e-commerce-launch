import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, LogOut, Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders } from '@/hooks/useOrders';
import { useAddresses } from '@/hooks/useAddresses';
import { AddressForm } from '@/components/account/AddressForm';
import { AddressCard } from '@/components/account/AddressCard';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { Address, Order } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AccountPage() {
  const { user, profile, signOut, isLoading, isAdmin } = useAuth();
  const { data: orders, refetch: refetchOrders } = useUserOrders(user?.id);
  const { data: addresses } = useAddresses(user?.id);
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleRetryPayment = useCallback(async (order: Order) => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    setRetryingOrderId(order.id);

    try {
      // Create new Razorpay order
      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          orderNumber: order.order_number,
          amount: order.total,
          notes: {
            order_number: order.order_number,
            customer_email: user?.email,
            retry: true,
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
        description: `Order ${order.order_number}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResult = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_number: order.order_number,
              },
            });

            if (verifyResult.error || !verifyResult.data.success) {
              throw new Error(verifyResult.data?.error || 'Payment verification failed');
            }

            toast.success('Payment successful!');
            refetchOrders();
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
          }
          setRetryingOrderId(null);
        },
        prefill: {
          name: profile?.full_name || '',
          email: user?.email || '',
          contact: profile?.phone || '',
        },
        notes: {
          order_number: order.order_number,
        },
        theme: {
          color: '#D4AF37',
        },
        modal: {
          ondismiss: function () {
            setRetryingOrderId(null);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setRetryingOrderId(null);
      });

      razorpay.open();
    } catch (error) {
      console.error('Retry payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setRetryingOrderId(null);
    }
  }, [razorpayLoaded, user, profile, refetchOrders]);

  if (isLoading || !user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const canRetryPayment = (order: Order) => {
    return (
      order.payment_method === 'razorpay' &&
      (order.payment_status === 'awaiting' || order.payment_status === 'failed') &&
      order.status !== 'cancelled'
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              My Account
            </h1>
            {isAdmin && (
              <Button asChild variant="outline" className="border-primary text-primary">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-foreground">Orders</h3>
              </div>
              <p className="text-3xl font-display font-semibold text-foreground">{orders?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total orders placed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-foreground">Addresses</h3>
              </div>
              <p className="text-3xl font-display font-semibold text-foreground">{addresses?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Saved addresses</p>
            </motion.div>
          </div>

          {/* Tabs for Orders and Addresses */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">
                  Order History
                </h2>

                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-card border border-border rounded-lg p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-medium text-foreground">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Retry Payment Button for failed/pending payments */}
                        {canRetryPayment(order) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span>Payment pending - complete your payment to confirm this order</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleRetryPayment(order)}
                              disabled={retryingOrderId === order.id}
                              className="bg-gradient-gold text-primary-foreground"
                            >
                              {retryingOrderId === order.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Retry Payment
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2 text-foreground">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Button asChild className="bg-gradient-gold text-primary-foreground">
                      <Link to="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="addresses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    My Addresses
                  </h2>
                  {!showAddressForm && (
                    <Button onClick={() => setShowAddressForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  )}
                </div>

                {showAddressForm && (
                  <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <AddressForm
                      address={editingAddress}
                      onSuccess={handleFormSuccess}
                      onCancel={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                    />
                  </div>
                )}

                {addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address, index) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={handleEditAddress}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  !showAddressForm && (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2 text-foreground">No Addresses Saved</h3>
                      <p className="text-muted-foreground mb-6">
                        Add an address to make checkout faster
                      </p>
                      <Button onClick={() => setShowAddressForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  )
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
