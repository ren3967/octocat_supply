import { createContext } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  discount?: number;
  quantity: number;
}

export interface CartProductInput {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  discount?: number;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProductInput, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
