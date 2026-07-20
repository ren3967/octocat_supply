import { createContext } from 'react';
import type { Product } from '../types/product';

export interface CartItem extends Product {
  quantity: number;
  unitPrice: number;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
