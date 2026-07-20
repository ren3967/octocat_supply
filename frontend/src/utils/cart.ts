import type { Product } from '../types/product';

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 25;
const FREE_SHIPPING_OFFSET = 0.01;

export const roundCurrency = (value: number) => Number(value.toFixed(2));

export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const getProductUnitPrice = (product: Product) =>
  roundCurrency(
    product.discount != null && product.discount > 0
      ? product.price * (1 - product.discount)
      : product.price,
  );

export const getAmountUntilFreeShipping = (subtotal: number) =>
  subtotal > FREE_SHIPPING_THRESHOLD
    ? 0
    : roundCurrency(FREE_SHIPPING_THRESHOLD - subtotal + FREE_SHIPPING_OFFSET);
