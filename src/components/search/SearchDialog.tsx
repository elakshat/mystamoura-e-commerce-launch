import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';
import { formatPrice } from '@/lib/utils';

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useSearch(query);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (slug: string) => {
    navigate(`/products/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleCategorySelect = (slug: string) => {
    navigate(`/collections/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex hover:text-primary"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg z-50 p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="border-0 bg-transparent focus-visible:ring-0 px-0 text-lg"
                  />
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {query.length < 2 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <p>Type at least 2 characters to search</p>
                      <p className="text-xs mt-2">
                        <kbd className="px-2 py-1 bg-muted rounded">⌘K</kbd> to open search
                      </p>
                    </div>
                  ) : data?.products?.length === 0 && data?.categories?.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="p-2">
                      {data?.categories && data.categories.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Collections</p>
                          {data.categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategorySelect(category.slug)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-medium">{category.name[0]}</span>
                              </div>
                              <span className="font-medium">{category.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {data?.products && data.products.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Products</p>
                          {data.products.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSelect(product.slug)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded bg-secondary overflow-hidden">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No img
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatPrice(product.sale_price || product.price, product.currency)}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}