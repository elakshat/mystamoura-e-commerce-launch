import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent" aria-label="Search">
          <Search className="h-[18px] w-[18px]" strokeWidth={1.3} />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="top-[12%] w-[calc(100%_-_2rem)] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-none border-0 bg-background p-0 shadow-[0_30px_80px_-20px_hsl(24_20%_10%/0.45)]"
      >
        <DialogTitle className="sr-only">Search fragrances</DialogTitle>
        <div className="flex items-center gap-4 border-b border-foreground/15 px-6 py-5 pr-14">
          <Search className="h-5 w-5 shrink-0 text-brass" strokeWidth={1.3} />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fragrances…"
            className="h-auto border-0 bg-transparent px-0 font-display text-xl md:text-2xl placeholder:italic placeholder:text-muted-foreground/70 focus-visible:ring-0"
          />
          {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-[60vh] overflow-y-auto md:max-h-[420px]">
          {query.length < 2 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-xl italic text-muted-foreground">Begin typing to explore the collection</p>
              <p className="mt-3 hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:block">
                <kbd className="mr-1 border border-foreground/20 px-1.5 py-0.5 font-sans">⌘K</kbd> opens search anywhere
              </p>
            </div>
          ) : data?.products?.length === 0 && data?.categories?.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-xl italic">Nothing found for “{query}”</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a fragrance name or a collection.</p>
            </div>
          ) : (
            <div className="py-3">
              {data?.categories && data.categories.length > 0 && (
                <div className="mb-2">
                  <p className="eyebrow px-6 py-2 text-[10px] text-brass">Collections</p>
                  {data.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                    >
                      <span className="font-display text-2xl">{category.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Collection</span>
                    </button>
                  ))}
                </div>
              )}

              {data?.products && data.products.length > 0 && (
                <div>
                  <p className="eyebrow px-6 py-2 text-[10px] text-brass">Fragrances</p>
                  {data.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product.slug)}
                      className="flex w-full items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                    >
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-t-full bg-nuit">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="min-w-0 flex-1 truncate font-display text-xl uppercase tracking-[0.05em]">{product.name}</p>
                      <p className="tabular text-sm text-muted-foreground">
                        {formatPrice(product.sale_price || product.price, product.currency)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
