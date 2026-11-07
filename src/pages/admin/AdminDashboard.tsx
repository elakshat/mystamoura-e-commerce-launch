import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, Package, AlertTriangle, Users, Clock, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { Panel, PanelEmpty } from '@/components/admin/Panel';
import { SalesChart } from '@/components/admin/SalesChart';
import { BestSellingProducts } from '@/components/admin/BestSellingProducts';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { useAdminStats, useRecentOrders, useActivityLog } from '@/hooks/useAdminStats';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, getStatusColor, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(6);
  const { data: activityLog, isLoading: activityLoading } = useActivityLog(6);
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-brass">Overview</p>
            <h1 className="mt-2 font-display text-[44px] font-light leading-none tracking-[-0.02em]">
              {greeting()}{firstName ? <>, <em className="font-light">{firstName}</em></> : ''}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Here’s how the house is doing today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/orders"
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-foreground/40"
            >
              Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/admin/products/new"
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-brass"
            >
              <Plus className="h-3.5 w-3.5" /> Add product
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="admin-stats-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[138px] rounded-sm" />)
          ) : (
            <>
              <StatCard title="Today's sales" value={formatPrice(stats?.todaySales || 0)} icon={IndianRupee} index={0} variant="gold" hint="Excludes unpaid online checkouts" />
              <StatCard title="Today's orders" value={stats?.todayOrders || 0} icon={ShoppingCart} index={1} hint="Paid online or cash on delivery" />
              <StatCard
                title="Open orders"
                value={stats?.pendingOrders || 0}
                icon={Clock}
                index={2}
                variant={stats?.pendingOrders ? 'warning' : 'default'}
                hint="Awaiting fulfilment"
              />
              <StatCard title="Products" value={stats?.totalProducts || 0} icon={Package} index={3} hint="In the catalogue" />
              <StatCard
                title="Low stock"
                value={stats?.lowStockProducts || 0}
                icon={AlertTriangle}
                index={4}
                variant={stats?.lowStockProducts ? 'warning' : 'default'}
                hint="Visible products, 5 or fewer left"
              />
              <StatCard title="Customers" value={stats?.totalCustomers || 0} icon={Users} index={5} hint="Unique buyers, incl. guests" />
            </>
          )}
        </div>

        {/* Sales + best sellers */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2"><SalesChart /></div>
          <BestSellingProducts />
        </div>

        {/* Recent orders + inventory & activity */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel eyebrow="Latest" title="Recent orders" action={{ to: '/admin/orders', label: 'All orders' }} className="xl:col-span-2">
            {ordersLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recentOrders?.length ? (
              <div className="-mx-6 -my-2 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="px-6 py-2 font-medium">Order</th>
                      <th className="py-2 font-medium">Placed</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="px-6 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="group transition-colors hover:bg-secondary/50">
                        <td className="px-6 py-3.5">
                          <Link to={`/admin/orders/${order.id}`} className="font-medium tracking-wide group-hover:text-brass">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="py-3.5 text-sm text-muted-foreground">{format(new Date(order.created_at), 'd MMM, h:mm a')}</td>
                        <td className="py-3.5">
                          <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]', getStatusColor(order.status))}>
                            {order.status}
                          </span>
                        </td>
                        <td className="tabular px-6 py-3.5 text-right font-medium">{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <PanelEmpty title="No orders yet" hint="New orders will appear here." />
            )}
          </Panel>

          <div className="space-y-6">
            <LowStockAlert />
            <Panel eyebrow="Recent" title="Activity">
              {activityLoading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : activityLog?.length ? (
                <ol className="relative space-y-5 border-l border-border pl-5">
                  {activityLog.map((log) => (
                    <li key={log.id} className="relative">
                      <span className="absolute -left-[23.5px] top-1.5 h-2 w-2 rounded-full border border-brass bg-card" />
                      <p className="text-sm leading-snug">{log.action}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {log.created_at && format(new Date(log.created_at), 'd MMM, h:mm a')}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <PanelEmpty title="No activity yet" />
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
