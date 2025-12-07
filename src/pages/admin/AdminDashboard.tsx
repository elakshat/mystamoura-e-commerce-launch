import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminStats, useRecentOrders, useActivityLog } from '@/hooks/useAdminStats';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: activityLog, isLoading: activityLoading } = useActivityLog(5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/products/new">
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Today's Sales"
                value={formatPrice(stats?.todaySales || 0)}
                icon={DollarSign}
                index={0}
                variant="gold"
              />
              <StatCard
                title="Today's Orders"
                value={stats?.todayOrders || 0}
                icon={ShoppingCart}
                index={1}
              />
              <StatCard
                title="Total Products"
                value={stats?.totalProducts || 0}
                icon={Package}
                index={2}
              />
              <StatCard
                title="Low Stock"
                value={stats?.lowStockProducts || 0}
                icon={AlertTriangle}
                index={3}
                variant={stats?.lowStockProducts ? 'warning' : 'default'}
              />
              <StatCard
                title="Customers"
                value={stats?.totalCustomers || 0}
                icon={Users}
                index={4}
              />
              <StatCard
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                icon={Clock}
                index={5}
                variant={stats?.pendingOrders ? 'warning' : 'default'}
              />
            </>
          )}
        </div>

        {/* Recent Orders & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentOrders?.length ? (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </motion.div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Activity Log</h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>

            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : activityLog?.length ? (
              <div className="space-y-4">
                {activityLog.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.created_at && format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No activity yet</p>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
