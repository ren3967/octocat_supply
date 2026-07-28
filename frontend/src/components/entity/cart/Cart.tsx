import { Link } from 'react-router-dom';
import { useCart } from '../../../context/useCart';
import { useTheme } from '../../../context/ThemeContext';
import OrderSummary from './OrderSummary';

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-[#071108]' : 'bg-gray-100'} pt-24 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className={`${darkMode ? 'text-light' : 'text-gray-800'} text-3xl md:text-4xl font-bold mb-6`}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div
            className={`${darkMode ? 'bg-gray-800 border-gray-700 text-light' : 'bg-white border-gray-200 text-gray-800'} rounded-xl border p-10 shadow-sm text-center`}
          >
            <p className="text-2xl font-semibold mb-4">Your cart is empty</p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              Explore products and add your first item.
            </p>
            <Link
              to="/products"
              className="inline-flex rounded-full bg-primary hover:bg-accent text-white font-semibold px-6 py-3 transition-colors"
            >
              Go To Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <section
              className={`${darkMode ? 'bg-[#1b211d] border-gray-700' : 'bg-white border-gray-200'} lg:col-span-2 rounded-xl border shadow-lg overflow-hidden`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]" aria-label="Cart items">
                  <thead className={darkMode ? 'bg-[#1a2617] text-light' : 'bg-gray-100 text-gray-800'}>
                    <tr>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        S. No.
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Product Image
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Product Name
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Unit Price
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Quantity
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Total
                      </th>
                      <th scope="col" className="px-4 py-4 text-left text-lg font-semibold">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const effectivePrice = item.price * (1 - (item.discount && item.discount > 0 ? item.discount : 0));
                      const lineTotal = effectivePrice * item.quantity;

                      return (
                        <tr
                          key={item.productId}
                          className={`border-t ${darkMode ? 'border-gray-700 text-light' : 'border-gray-200 text-gray-800'}`}
                        >
                          <td className="px-4 py-4 text-lg font-semibold">{index + 1}</td>
                          <td className="px-4 py-4">
                            <img
                              src={`/${item.imgName}`}
                              alt={item.name}
                              className="w-24 h-24 object-contain"
                            />
                          </td>
                          <td className="px-4 py-4 text-lg font-semibold">{item.name}</td>
                          <td className="px-4 py-4 text-xl font-semibold">{formatCurrency(effectivePrice)}</td>
                          <td className="px-4 py-4">
                            <div className="inline-flex items-center rounded-xl border border-gray-600 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-10 w-10 text-2xl"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                -
                              </button>
                              <span className="w-12 text-center text-lg font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-10 w-10 text-2xl"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xl font-semibold">{formatCurrency(lineTotal)}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="text-primary hover:text-accent text-sm font-semibold"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-700/30 p-4 flex flex-col sm:flex-row gap-3 justify-between">
                <label className="sr-only" htmlFor="coupon-code">
                  Coupon code
                </label>
                <div className="flex flex-1">
                  <input
                    id="coupon-code"
                    type="text"
                    placeholder="Coupon Code"
                    className={`${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} flex-1 rounded-l-full border px-5 py-3`}
                  />
                  <button
                    type="button"
                    className="rounded-r-full bg-primary hover:bg-accent text-white font-semibold px-6 py-3 transition-colors"
                  >
                    Apply Coupon
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-primary hover:bg-accent text-white font-semibold px-8 py-3 transition-colors"
                >
                  Update Cart
                </button>
              </div>
            </section>

            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
