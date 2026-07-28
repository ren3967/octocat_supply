import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CartContext, CartContextType, CartItem, CartProductInput } from './cartContextUtils';

const STORAGE_KEY = 'octocat-cart-items';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    isFiniteNumber(item.productId) &&
    typeof item.name === 'string' &&
    isFiniteNumber(item.price) &&
    typeof item.imgName === 'string' &&
    isFiniteNumber(item.quantity) &&
    item.quantity > 0 &&
    (item.discount === undefined || isFiniteNumber(item.discount))
  );
};

const normalizeQuantity = (quantity: number) => Math.max(1, Math.floor(quantity));

const loadInitialItems = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: normalizeQuantity(item.quantity),
    }));
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitialItems);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: CartProductInput, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      return;
    }

    const safeQuantity = Math.floor(quantity);

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.productId);

      if (existingIndex === -1) {
        return [...prev, { ...product, quantity: safeQuantity }];
      }

      return prev.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + safeQuantity } : item,
      );
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    const safeQuantity = normalizeQuantity(quantity);
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item)),
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * (1 - (item.discount && item.discount > 0 ? item.discount : 0)) * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
