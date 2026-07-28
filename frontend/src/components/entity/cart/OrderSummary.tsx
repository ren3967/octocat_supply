import { useCart } from '../../../context/useCart';
import { useTheme } from '../../../context/ThemeContext';

const DISCOUNT_RATE = 0.05;
const SHIPPING_FEE = 10;

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function OrderSummary() {
  const { items, subtotal } = useCart();
  const { darkMode } = useTheme();

  const discount = subtotal * DISCOUNT_RATE;
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const grandTotal = subtotal - discount + shipping;

  return (
    <aside
      className={`${darkMode ? 'bg-[#1f2a1f] border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-lg overflow-hidden`}
      aria-label="Order summary"
    >
      <h2
        className={`${darkMode ? 'bg-[#202a1d] text-light' : 'bg-gray-100 text-gray-800'} text-2xl md:text-3xl font-bold text-center py-6`}
      >
        Order Summary
      </h2>
      <div className="divide-y divide-gray-700/30">
        <div className="grid grid-cols-2 px-6 py-4 text-base md:text-lg font-semibold">
          <span className={darkMode ? 'text-light' : 'text-gray-800'}>Subtotal</span>
          <span className={`${darkMode ? 'text-light' : 'text-gray-800'} text-right`}>
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="grid grid-cols-2 px-6 py-4 text-base md:text-lg font-semibold">
          <span className={darkMode ? 'text-light' : 'text-gray-800'}>Discount(5%)</span>
          <span className={`${darkMode ? 'text-light' : 'text-gray-800'} text-right`}>
            -{formatCurrency(discount)}
          </span>
        </div>
        <div className="grid grid-cols-2 px-6 py-4 text-base md:text-lg font-semibold">
          <span className={darkMode ? 'text-light' : 'text-gray-800'}>Shipping</span>
          <span className={`${darkMode ? 'text-light' : 'text-gray-800'} text-right`}>
            {formatCurrency(shipping)}
          </span>
        </div>
        <div className="grid grid-cols-2 px-6 py-4 text-xl md:text-2xl font-bold">
          <span className={darkMode ? 'text-light' : 'text-gray-900'}>Grand Total</span>
          <span className={`${darkMode ? 'text-light' : 'text-gray-900'} text-right`}>
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <button
          type="button"
          className={`w-full rounded-full py-4 text-lg font-semibold transition-colors ${items.length > 0
            ? 'bg-primary hover:bg-accent text-white'
            : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
            }`}
          disabled={items.length === 0}
          aria-label="Proceed to checkout"
        >
          Proceed To Checkout
        </button>
      </div>
    </aside>
  );
}
