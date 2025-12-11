import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, User, Calendar, Mail, Phone } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { OrderTimeline } from '@/components/orders/OrderTimeline';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

interface ShippingAddress {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id || '');
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (status: OrderStatus) => {
    if (id) {
      updateStatus.mutate({ id, status });
    }
  };

  const shippingAddress = order?.shipping_address as ShippingAddress | null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/orders">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold">
                Order {order.order_number}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Placed on {order.created_at && format(new Date(order.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>
          <Select
            value={order.status || 'pending'}
            onValueChange={(status) => handleStatusChange(status as OrderStatus)}
          >
            <SelectTrigger className={`w-40 ${getStatusColor(order.status || 'pending')}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-secondary/30 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.product_name}</p>
                          {item.variant_size && (
                            <p className="text-sm text-muted-foreground">
                              Size: {item.variant_size}
                            </p>
                          )}
                          {item.variant_sku && (
                            <p className="text-xs text-muted-foreground font-mono">
                              SKU: {item.variant_sku}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount_amount && order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatPrice(order.tax_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTimeline currentStatus={order.status || 'pending'} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shippingAddress?.full_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{shippingAddress.full_name}</span>
                    </div>
                  )}
                  {order.guest_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.guest_email}</span>
                    </div>
                  )}
                  {shippingAddress?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shippingAddress.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shippingAddress ? (
                    <div className="space-y-1 text-sm">
                      {shippingAddress.full_name && (
                        <p className="font-medium">{shippingAddress.full_name}</p>
                      )}
                      {shippingAddress.address_line1 && (
                        <p className="text-foreground">{shippingAddress.address_line1}</p>
                      )}
                      {shippingAddress.address_line2 && (
                        <p className="text-foreground">{shippingAddress.address_line2}</p>
                      )}
                      <p className="text-foreground">
                        {[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {shippingAddress.country && (
                        <p className="text-muted-foreground">{shippingAddress.country}</p>
                      )}
                      {shippingAddress.phone && (
                        <p className="text-muted-foreground pt-2">
                          Phone: {shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No shipping address available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="text-sm font-medium capitalize">
                      {order.payment_method || 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className="capitalize">
                      {order.payment_status || 'Pending'}
                    </Badge>
                  </div>
                  {order.payment_id && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payment ID</span>
                      <span className="text-xs font-mono">{order.payment_id}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
