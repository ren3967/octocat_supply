import type { Product } from '../types/product';

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 25;
const MINIMUM_ADDITIONAL_CENTS = 1;

export const roundCurrency = (value: number) => Number(value.toFixed(2));

export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const normalizeQuantity = (quantity: number) => Math.max(1, Math.floor(quantity));

export const getProductUnitPrice = (product: Product) =>
  roundCurrency(
    product.discount != null && product.discount > 0
      ? product.price * (1 - product.discount)
      : product.price,
  );

export const getAmountUntilFreeShipping = (subtotal: number) =>
  subtotal > FREE_SHIPPING_THRESHOLD
    ? 0
    : roundCurrency(
        (FREE_SHIPPING_THRESHOLD * 100 + MINIMUM_ADDITIONAL_CENTS - Math.round(subtotal * 100)) /
          100,
      );
