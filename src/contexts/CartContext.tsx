import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductVariantInfo } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariantInfo | null) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isAnimating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(item: CartItem): string {
  return item.variant ? `${item.product.id}_${item.variant.id}` : item.product.id;
}

function matchesItem(item: CartItem, productId: string, variantId?: string | null): boolean {
  if (variantId) {
    return item.product.id === productId && item.variant?.id === variantId;
  }
  return item.product.id === productId && !item.variant;
}

function getItemPrice(item: CartItem): number {
  if (item.variant) {
    return item.variant.sale_price && item.variant.sale_price < item.variant.price
      ? item.variant.sale_price
      : item.variant.price;
  }
  return item.product.sale_price && item.product.sale_price < item.product.price
    ? item.product.sale_price
    : item.product.price;
}

function getItemStock(item: CartItem): number {
  return item.variant ? item.variant.stock : item.product.stock;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariantInfo | null) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    const stock = variant ? variant.stock : product.stock;
    if (stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => matchesItem(item, product.id, variant?.id));
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, stock);
        toast.success(`Updated ${product.name}${variant ? ` - ${variant.size}` : ''} quantity`);
        return prev.map((item) =>
          matchesItem(item, product.id, variant?.id)
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      const displayName = variant ? `${product.name} - ${variant.size}` : product.name;
      toast.success(`Added ${displayName} to cart`);
      return [...prev, { product, quantity: Math.min(quantity, stock), variant: variant || null }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setItems((prev) => {
      const item = prev.find((i) => matchesItem(i, productId, variantId));
      if (item) {
        toast.info(`Removed ${item.product.name}${item.variant ? ` - ${item.variant.size}` : ''} from cart`);
      }
      return prev.filter((item) => !matchesItem(item, productId, variantId));
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        matchesItem(item, productId, variantId)
          ? { ...item, quantity: Math.min(quantity, getItemStock(item)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Cart cleared');
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + getItemPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isAnimating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
