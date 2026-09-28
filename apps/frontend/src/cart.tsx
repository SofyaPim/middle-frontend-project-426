import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadCart, saveCart, incrementCartItem, setCartQuantity, removeCartItem,
  type CartItem,
} from './lib/cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  addToCart: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((productId: number) => {
    setItems((prev) => incrementCartItem(prev, productId));
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => setCartQuantity(prev, productId, quantity));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => removeCartItem(prev, productId));
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, count, addToCart, setQuantity, removeItem }),
    [items, count, addToCart, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

