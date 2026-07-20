import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CartContext } from './cartContextUtils';
import type { CartItem } from './cartContextUtils';
import type { Product } from '../types/product';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  getProductUnitPrice,
  normalizeQuantity,
  roundCurrency,
} from '../utils/cart';

const CART_STORAGE_KEY = 'cart';

const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.productId === 'number' &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'number' &&
    typeof item.sku === 'string' &&
    typeof item.unit === 'string' &&
    typeof item.imgName === 'string' &&
    typeof item.supplierId === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.unitPrice === 'number'
  );
};

const getStoredCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .filter(isCartItem)
      .map((item) => ({
        ...item,
        quantity: normalizeQuantity(item.quantity),
        unitPrice: roundCurrency(item.unitPrice),
      }));
  } catch (error) {
    console.warn('Unable to restore cart from localStorage.', error);
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCartItems);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    const normalizedQuantity = normalizeQuantity(quantity);
    const unitPrice = getProductUnitPrice(product);

    setItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.productId === product.productId);

      if (existingItem) {
        return previousItems.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                ...product,
                quantity: item.quantity + normalizedQuantity,
                unitPrice,
              }
            : item,
        );
      }

      return [...previousItems, { ...product, quantity: normalizedQuantity, unitPrice }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((previousItems) => previousItems.filter((item) => item.productId !== productId));
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: normalizeQuantity(quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    setItems((previousItems) => previousItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => roundCurrency(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)),
    [items],
  );
  const shipping = subtotal === 0 || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = roundCurrency(subtotal + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shipping,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
