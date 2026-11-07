import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  Star,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navGroups = [
  { label: 'Overview', items: [{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { href: '/admin/customers', icon: Users, label: 'Customers' },
      { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/products', icon: Package, label: 'Products' },
      { href: '/admin/reviews', icon: Star, label: 'Reviews' },
    ],
  },
  { label: 'Store', items: [{ href: '/admin/settings', icon: Settings, label: 'Settings' }] },
];

/** Dashboard is active only on /admin; other sections stay active on their sub-pages. */
const isActivePath = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const name = profile?.full_name || 'Admin';
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const brand = (
    <Link to="/admin" className="block">
      <span className="brand-wordmark block text-[17px] text-foreground">Myst Amoura</span>
      <span className="mt-1.5 block text-[9px] font-medium uppercase tracking-[0.34em] text-brass">Atelier · Admin</span>
    </Link>
  );

  const nav = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6" aria-label="Admin">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground/80">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActivePath(location.pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] transition-colors',
                    active ? 'bg-background text-foreground shadow-[0_1px_0_hsl(var(--border))]' : 'text-foreground/65 hover:bg-background/60 hover:text-foreground'
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-brass" />}
                  <item.icon className={cn('h-[17px] w-[17px]', active ? 'text-brass' : '')} strokeWidth={1.4} />
                  <span className="font-medium tracking-[0.02em]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-sidebar-border p-4">
      <div className="mb-3 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass/50 bg-background font-display text-sm text-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{profile?.email || 'admin@mystamoura.com'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/"
          className="flex h-9 items-center justify-center gap-1.5 rounded-sm border border-border bg-background text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          Store <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-9 items-center justify-center gap-1.5 rounded-sm text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden border-r border-sidebar-border bg-sidebar-background lg:flex lg:w-64 lg:flex-col">
        <div className="border-b border-sidebar-border px-7 py-7">{brand}</div>
        {nav()}
        {footer}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[hsl(var(--nuit)/0.35)] backdrop-blur-[2px] lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar-background lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-6">
                {brand}
                <button type="button" onClick={() => setIsSidebarOpen(false)} className="flex h-9 w-9 items-center justify-center" aria-label="Close menu">
                  <X className="h-5 w-5" strokeWidth={1.4} />
                </button>
              </div>
              {nav(() => setIsSidebarOpen(false))}
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 lg:px-10">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsSidebarOpen(true)} className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" strokeWidth={1.4} />
              </button>
              <span className="brand-wordmark text-[15px] lg:hidden">Myst Amoura</span>
              <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:inline">
                {format(new Date(), 'EEEE, d MMMM yyyy')}
              </span>
            </div>
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              View store <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-4 lg:p-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-[1400px]"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
