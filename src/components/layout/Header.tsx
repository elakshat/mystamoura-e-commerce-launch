import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { SearchDialog } from '@/components/search/SearchDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, isAnimating } = useCart();
  const { user, isAdmin } = useAuth();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const navLinks = [
    { href: '/products', label: 'Shop All' },
    { href: '/collections/for-him', label: 'For Him' },
    { href: '/collections/for-her', label: 'For Her' },
    { href: '/collections/unisex', label: 'Unisex' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {settings?.announcement?.enabled && (
        <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
          {settings.announcement.text}
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-wider text-gradient-gold">
                MYSTAMOURA
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:left-0 after:bottom-[-4px] after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-0.5 md:space-x-2">
              <SearchDialog />

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-9 w-9 md:h-10 md:w-10"
                onClick={() => navigate(user ? '/account' : '/auth')}
                aria-label={user ? 'My Account' : 'Sign In'}
              >
                <User className="h-5 w-5" />
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary hidden sm:flex h-9 w-9 md:h-10 md:w-10"
                  onClick={() => navigate('/wishlist')}
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              )}

              <motion.div
                animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:text-primary h-9 w-9 md:h-10 md:w-10"
                  onClick={() => navigate('/cart')}
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={itemCount}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 md:h-5 md:w-5 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border/50 last:border-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user && (
                  <Link
                    to="/wishlist"
                    className="block py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                )}
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-base font-medium text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
