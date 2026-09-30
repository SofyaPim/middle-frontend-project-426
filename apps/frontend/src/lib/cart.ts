export type CartItem = {
  productId: number;
  quantity: number;
};

const CART_KEY = 'pc-shop-cart';

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' && item !== null &&
        typeof (item as CartItem).productId === 'number' &&
        typeof (item as CartItem).quantity === 'number' &&
        (item as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function incrementCartItem(cart: CartItem[], productId: number): CartItem[] {
  const existing = cart.find((item) => item.productId === productId);
  if (!existing) return [...cart, { productId, quantity: 1 }];
  return cart.map((item) =>
    item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
  );
}
export function setCartQuantity(cart: CartItem[], productId: number, quantity: number): CartItem[] {
  if (quantity <= 0) return cart.filter((item) => item.productId !== productId);
  return cart.map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
}

export function removeCartItem(cart: CartItem[], productId: number): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

export function clearCartStorage(): void {
  localStorage.removeItem(CART_KEY);
}