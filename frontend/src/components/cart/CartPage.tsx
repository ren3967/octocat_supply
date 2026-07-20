import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/useCart';
import {
  FREE_SHIPPING_THRESHOLD,
  formatCurrency,
  getAmountUntilFreeShipping,
} from '../../utils/cart';

export default function CartPage() {
  const { darkMode } = useTheme();
  const { items, itemCount, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} px-4 pb-16 pt-24 transition-colors duration-300`}
      >
        <div className="mx-auto max-w-4xl">
          <div
            className={`rounded-3xl border p-10 text-center shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800 text-light' : 'border-gray-200 bg-white text-gray-800'}`}
          >
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className={`mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Add a few smart cat essentials to get started.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-accent"
            >
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amountUntilFreeShipping = shipping === 0 ? 0 : getAmountUntilFreeShipping(subtotal);

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} px-4 pb-16 pt-24 transition-colors duration-300`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Shopping Cart
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {itemCount} item{itemCount === 1 ? '' : 's'} ready to ship.
            </p>
          </div>
          <Link
            to="/products"
            className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} font-medium transition-colors hover:text-primary`}
          >
            Continue shopping
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.productId}
                className={`rounded-3xl border p-4 shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800 text-light' : 'border-gray-200 bg-white text-gray-800'}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div
                    className={`flex h-32 w-full items-center justify-center rounded-2xl p-3 sm:w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <img
                      src={`/${item.imgName}`}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.sku} • {item.unit}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm uppercase tracking-wide text-primary">Unit price</p>
                        <p className="text-lg font-semibold" data-testid="cart-item-unit-price">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div
                        className={`inline-flex items-center rounded-xl p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className={`h-10 w-10 rounded-lg transition-colors hover:text-primary ${darkMode ? 'text-light' : 'text-gray-700'}`}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className="min-w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className={`h-10 w-10 rounded-lg transition-colors hover:text-primary ${darkMode ? 'text-light' : 'text-gray-700'}`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="font-medium text-red-500 transition-colors hover:text-red-400"
                        >
                          Remove
                        </button>
                        <div className="text-right">
                          <p className="text-sm uppercase tracking-wide text-primary">Subtotal</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside
            className={`rounded-3xl border p-6 shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800 text-light' : 'border-gray-200 bg-white text-gray-800'}`}
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Order summary</h2>
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
                </p>
              </div>
              <div
                className={`space-y-3 border-y py-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span data-testid="cart-summary-shipping">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-primary/10 text-gray-700'}`}
              >
                {shipping === 0
                  ? 'You unlocked free shipping.'
                  : `Add ${formatCurrency(amountUntilFreeShipping)} more to get free shipping.`}
              </p>
              <button
                type="button"
                onClick={clearCart}
                className={`w-full rounded-lg border px-4 py-3 font-medium transition-colors ${darkMode ? 'border-gray-600 text-light hover:border-primary hover:text-primary' : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'}`}
              >
                Clear cart
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
