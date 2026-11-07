import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Heart, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { SearchDialog } from '@/components/search/SearchDialog';
import { cn } from '@/lib/utils';

const shopLinks = [
  { href: '/products', label: 'Shop All' },
  { href: '/collections/for-him', label: 'For Him' },
  { href: '/collections/for-her', label: 'For Her' },
  { href: '/collections/unisex', label: 'Unisex' },
];

const houseLinks = [
  { href: '/about', label: 'The House' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);
  const { itemCount, isAnimating } = useCart();
  const { user, isAdmin } = useAuth();
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setCompact(window.scrollY > 140);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  // Lets other sticky bars (e.g. the shop filter) sit flush under the header.
  useEffect(() => {
    document.documentElement.style.setProperty('--header-h', compact ? '60px' : '76px');
  }, [compact]);

  useEffect(() => {
    // Open the menu flush under the header, wherever the announcement bar has left it.
    if (isMenuOpen && headerRef.current) setMenuTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
    document.documentElement.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [isMenuOpen]);

  const navClass = 'nav-link label-caps text-[11px] text-foreground/70 hover:text-foreground transition-colors';

  return (
    <>
      {settings?.announcement?.enabled && (
        <div className="on-nuit px-4 py-2.5 text-center">
          <p className="eyebrow text-[10px] tracking-[0.3em] text-nuit-foreground/85">
            {settings.announcement.text}
          </p>
        </div>
      )}

      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-500',
          scrolled ? 'glass-bar border-border' : 'border-transparent bg-background'
        )}
      >
        <div className="container mx-auto px-5 md:px-12">
          <div className={cn('grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-4 transition-[height] duration-500 ease-silk md:gap-x-10', compact ? 'md:h-[60px]' : 'md:h-[76px]')}>
            {/* Left: menu toggle (mobile) / shop links (desktop) */}
            <div className="flex items-center">
              <button
                type="button"
                className="-ml-2 flex h-11 w-11 items-center justify-center xl:hidden"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                <span className="relative block h-3 w-6">
                  <span className={cn('absolute left-0 top-0 h-px w-6 bg-foreground transition-transform duration-500', isMenuOpen && 'translate-y-[6px] rotate-45')} />
                  <span className={cn('absolute bottom-0 left-0 h-px bg-foreground transition-all duration-500', isMenuOpen ? 'w-6 -translate-y-[5px] -rotate-45' : 'w-4')} />
                </span>
              </button>
              <nav aria-label="Shop" className="hidden items-center gap-8 xl:flex">
                {shopLinks.map((link) => (
                  <NavLink key={link.href} to={link.href} end={link.href === '/products'} className={navClass}>
                    {link.label}
                  </NavLink>
                ))}
                <NavLink to="/about" className={cn(navClass, 'hidden min-[1440px]:inline-flex')}>
                  The House
                </NavLink>
              </nav>
            </div>

            {/* Center: wordmark */}
            <Link to="/" className="flex flex-col items-center leading-none" aria-label="Myst Amoura — home">
              <span className={cn('brand-wordmark whitespace-nowrap text-[17px] !tracking-[0.2em] transition-[font-size] duration-500 ease-silk sm:text-[20px] md:!tracking-[0.32em]', compact ? 'md:text-[20px]' : 'md:text-[24px]')}>Myst Amoura</span>
              <span className={cn('hidden overflow-hidden text-[9px] font-medium uppercase tracking-[0.42em] text-muted-foreground transition-all duration-500 md:block', compact ? 'md:mt-0 md:max-h-0 md:opacity-0' : 'md:mt-1.5 md:max-h-4 md:opacity-100')}>
                Parfums · India
              </span>
            </Link>

            {/* Right: house links + actions */}
            <div className="flex min-w-0 items-center justify-end gap-1 md:gap-2">

              <SearchDialog />

              <Button
                variant="ghost"
                size="icon"
                className="hidden h-10 w-10 hover:bg-transparent md:inline-flex"
                onClick={() => navigate(user ? '/account' : '/auth')}
                aria-label={user ? 'My Account' : 'Sign In'}
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-10 w-10 hover:bg-transparent sm:inline-flex"
                  onClick={() => navigate('/wishlist')}
                  aria-label="Wishlist"
                >
                  <Heart className="h-[18px] w-[18px]" strokeWidth={1.3} />
                </Button>
              )}

              <motion.div animate={isAnimating ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.35 }}>
                <button
                  type="button"
                  className="relative flex h-10 items-center gap-2 pl-2"
                  onClick={() => navigate('/cart')}
                  aria-label={`Bag, ${itemCount} items`}
                >
                  <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.3} />
                  <span className="label-caps hidden text-[11px] md:inline">Bag</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={itemCount}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      className={cn(
                        'tabular flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-medium',
                        itemCount > 0 ? 'bg-foreground text-background' : 'border border-border text-muted-foreground'
                      )}
                    >
                      {itemCount}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </motion.div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="label-caps ml-3 hidden h-8 items-center border border-foreground px-3 text-[10px] transition-colors hover:bg-foreground hover:text-background lg:inline-flex"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ top: menuTop }}
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-background xl:hidden"
          >
            <nav aria-label="Menu" className="flex min-h-full flex-col px-6 pb-28 pt-8">
              <p className="eyebrow mb-4 text-brass">Shop</p>
              {shopLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link to={link.href} className="flex items-center justify-between border-b py-4">
                    <span className="font-display text-[38px] font-light leading-none">{link.label}</span>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" strokeWidth={1.2} />
                  </Link>
                </motion.div>
              ))}

              <p className="eyebrow mb-3 mt-10 text-brass">The House</p>
              <div className="grid grid-cols-2 gap-y-1">
                {[...houseLinks, { href: user ? '/account' : '/auth', label: user ? 'Account' : 'Sign In' }, ...(user ? [{ href: '/wishlist', label: 'Wishlist' }] : [])].map((link) => (
                  <Link key={link.href + link.label} to={link.href} className="py-2 font-display text-2xl">
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" className="py-2 font-display text-2xl text-brass">Admin</Link>
                )}
              </div>

              <p className="mt-auto pt-12 font-display text-lg italic text-muted-foreground">
                Perfumes born in India.
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
