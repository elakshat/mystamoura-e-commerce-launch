import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    { id: 'home', href: '/', icon: Home, label: 'Home' },
    { id: 'shop', href: '/products', icon: LayoutGrid, label: 'Shop' },
    { id: 'cart', href: '/cart', icon: ShoppingBag, label: 'Bag', badge: itemCount },
    { id: 'wishlist', href: user ? '/wishlist' : '/auth', icon: Heart, label: 'Saved' },
    { id: 'account', href: user ? '/account' : '/auth', icon: User, label: 'Account' },
  ];

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-bottom-nav glass-bar safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-full flex-1 flex-col items-center justify-center transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 1.7 : 1.3} />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-medium text-background"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>
                )}
              </div>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em]">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 h-px w-8 bg-foreground"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
