import { test, expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

/**
 * Cart page management E2E tests
 * Implements: frontend/tests/features/cart-management.feature
 *
 * Notes:
 * - The cart page and cart navigation icon do not exist yet.
 * - These tests are intentionally marked fixme so they document the expected
 *   future behavior without forcing production app changes for this task.
 * - Selectors that target the future cart UI use an explicit contract:
 *   accessible names for navigation/actions and data-testid values for summary
 *   and line-item assertions.
 */

const FUTURE_CART_REASON =
  'Cart page and cart navigation are not implemented yet; this spec documents the expected future UI contract.';

const API_BASE_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
const CART_STORAGE_KEY = 'octocat-cart';
const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_FEE = 25;
const MAX_TAB_ATTEMPTS = 15;

const CATALOG_PRODUCT_NAMES = {
  pawTrackSmartCollar: 'PawTrack Smart Collar',
  thermoNestDeluxe: 'ThermoNest Deluxe',
} as const;

const LEGACY_UNAVAILABLE_PRODUCT = {
  productId: 9999,
  name: 'Legacy Laser Toy',
  price: 49.99,
  imgName: 'legacy-laser.png',
} as const;

interface CatalogProduct {
  productId: number;
  name: string;
  price: number;
  imgName: string;
}

interface CartStorageItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imgName: string;
}

function isCatalogProduct(value: unknown): value is CatalogProduct {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CatalogProduct).productId === 'number' &&
    typeof (value as CatalogProduct).name === 'string' &&
    typeof (value as CatalogProduct).price === 'number' &&
    typeof (value as CatalogProduct).imgName === 'string'
  );
}

async function fetchCatalogProduct(
  request: APIRequestContext,
  productName: string,
): Promise<CatalogProduct> {
  const response = await request.get(`${API_BASE_URL}/api/products`);
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload) || !payload.every(isCatalogProduct)) {
    throw new Error('Products API returned an unexpected response shape.');
  }

  const products = payload;
  const product = products.find(({ name }) => name === productName);

  if (!product) {
    throw new Error(`Unable to find catalog product named "${productName}".`);
  }

  return product;
}

const cart = {
  navLink: (page: Page) => page.getByRole('link', { name: /cart/i }),
  badge: (page: Page) => page.getByTestId('cart-count-badge'),
  heading: (page: Page) => page.getByRole('heading', { name: 'Cart' }),
  emptyState: (page: Page) => page.getByRole('status'),
  networkError: (page: Page) => page.getByRole('alert'),
  retryButton: (page: Page) => page.getByRole('button', { name: 'Retry loading cart' }),
  checkoutButton: (page: Page) => page.getByRole('button', { name: 'Checkout' }),
  subtotalValue: (page: Page) => page.getByTestId('cart-subtotal-value'),
  shippingValue: (page: Page) => page.getByTestId('cart-shipping-value'),
  totalValue: (page: Page) => page.getByTestId('cart-total-value'),
  item: (page: Page, productId: number) => page.getByTestId(`cart-item-${productId}`),
  itemQuantity: (page: Page, productId: number) => page.getByTestId(`cart-item-quantity-${productId}`),
  itemTotal: (page: Page, productId: number) => page.getByTestId(`cart-item-total-${productId}`),
  increaseButton: (page: Page, productName: string) =>
    page.getByRole('button', { name: `Increase quantity of ${productName}` }),
  decreaseButton: (page: Page, productName: string) =>
    page.getByRole('button', { name: `Decrease quantity of ${productName}` }),
  removeButton: (page: Page, productName: string) =>
    page.getByRole('button', { name: `Remove ${productName} from cart` }),
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
const getExpectedShippingLabel = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : formatCurrency(STANDARD_SHIPPING_FEE);
const getExpectedTotal = (subtotal: number) =>
  formatCurrency(
    subtotal >= FREE_SHIPPING_THRESHOLD ? subtotal : subtotal + STANDARD_SHIPPING_FEE,
  );

async function goToProductCatalog(page: Page) {
  await page.goto('/products');
  await expect(page.locator('h1:has-text("Products")')).toBeVisible();
}

async function addProductToCartFromCatalog(page: Page, productName: string, quantity: number) {
  await goToProductCatalog(page);

  const searchInput = page.locator('input[aria-label="Search products"]');
  await searchInput.fill(productName);
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  const increaseQuantityButton = page.getByRole('button', {
    name: `Increase quantity of ${productName}`,
  });
  const quantityValue = page.locator(`[aria-label="Quantity of ${productName}"]`);

  for (let count = 0; count < quantity; count += 1) {
    await increaseQuantityButton.click();
    await expect(quantityValue).toHaveText(String(count + 1));
  }

  const addToCartButton = page.getByRole('button', {
    name: `Add ${quantity} ${productName} to cart`,
  });
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
}

async function clearCartState(page: Page) {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
  await page.evaluate((storageKey) => window.localStorage.removeItem(storageKey), CART_STORAGE_KEY);
  await page.reload();
  await expect(page.locator('nav')).toBeVisible();
}

async function seedCartState(page: Page, items: CartStorageItem[]) {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();

  // Expected future localStorage contract based on the cart persistence
  // requirement for the planned cart experience.
  await page.evaluate(
    ({ storageKey, storageItems }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(storageItems));
    },
    { storageKey: CART_STORAGE_KEY, storageItems: items },
  );
  await page.reload();
  await expect(page.locator('nav')).toBeVisible();
}

async function openCartFromNavigation(page: Page) {
  await cart.navLink(page).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(cart.heading(page)).toBeVisible();
}

async function failAllCatalogRequests(page: Page) {
  await page.route('**/api/products', async (route) => {
    await route.abort('internetdisconnected');
  });
}

async function failNextCatalogRequest(page: Page) {
  // Use Playwright's one-shot route so only the next request simulates a
  // network disconnect and the retry request can succeed.
  await page.route('**/api/products', async (route) => {
    await route.abort('internetdisconnected');
  }, { times: 1 });
}

async function getFocusSignature(page: Page) {
  return page.evaluate(() => {
    const activeElement = document.activeElement as HTMLElement | null;
    return (
      activeElement?.getAttribute('aria-label') ??
      activeElement?.id ??
      activeElement?.outerHTML.slice(0, 100) ??
      ''
    );
  });
}

async function tabToElement(page: Page, locator: Locator, targetName: string, attempts = MAX_TAB_ATTEMPTS) {
  const startingFocusSignature = await getFocusSignature(page);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const previousFocusSignature = await getFocusSignature(page);
    await page.keyboard.press('Tab');
    await expect.poll(async () => getFocusSignature(page)).not.toBe(previousFocusSignature);
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }

  throw new Error(
    `Unable to reach "${targetName}" using keyboard navigation within ${attempts} tabs from "${startingFocusSignature}".`,
  );
}

test.describe('Cart page management', () => {
  test.fixme(true, FUTURE_CART_REASON);

  test.beforeEach(async ({ page }) => {
    // Navigate away from about:blank so localStorage context is available.
    await page.goto('/');
  });

  test('View an empty cart', async ({ page }) => {
    // Given I have no items in my cart
    await clearCartState(page);

    // When I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then I land on the cart page
    await expect(page).toHaveURL(/\/cart$/);

    // And I see the heading "Cart"
    await expect(cart.heading(page)).toBeVisible();

    // And I see the empty cart message "Your cart is empty"
    await expect(cart.emptyState(page)).toContainText('Your cart is empty');

    // And the checkout button is disabled
    await expect(cart.checkoutButton(page)).toBeDisabled();
  });

  test('Add products from the catalog and review the cart', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given I am viewing the product catalog
    await goToProductCatalog(page);

    // When I add 2 "PawTrack Smart Collar" items to my cart
    await addProductToCartFromCatalog(page, product.name, 2);

    // And I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then the cart icon shows 2 items
    await expect(cart.badge(page)).toHaveText('2');

    // And the cart contains 2 "PawTrack Smart Collar" items
    await expect(cart.item(page, product.productId)).toContainText(product.name);
    await expect(cart.itemQuantity(page, product.productId)).toHaveText('2');

    // And the subtotal is "$159.98"
    await expect(cart.subtotalValue(page)).toHaveText(formatCurrency(product.price * 2));

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText(getExpectedShippingLabel(product.price * 2));

    // And the total is "$159.98"
    await expect(cart.totalValue(page)).toHaveText(getExpectedTotal(product.price * 2));
  });

  test('Update quantities from the cart page', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I increase the quantity of "PawTrack Smart Collar" to 2
    await cart.increaseButton(page, product.name).click();

    // Then the line item quantity for "PawTrack Smart Collar" is 2
    await expect(cart.itemQuantity(page, product.productId)).toHaveText('2');

    // And the line item total is "$159.98"
    await expect(cart.itemTotal(page, product.productId)).toHaveText(formatCurrency(product.price * 2));

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText(getExpectedShippingLabel(product.price * 2));

    // And the total is "$159.98"
    await expect(cart.totalValue(page)).toHaveText(getExpectedTotal(product.price * 2));
  });

  test('Remove the final item from the cart', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I remove "PawTrack Smart Collar" from the cart
    await cart.removeButton(page, product.name).click();

    // Then I see the empty cart message "Your cart is empty"
    await expect(cart.emptyState(page)).toContainText('Your cart is empty');

    // And the cart icon shows 0 items
    await expect(cart.badge(page)).toHaveText('0');
  });

  [
    {
      name: 'Apply shipping when the subtotal stays under $100',
      itemName: CATALOG_PRODUCT_NAMES.thermoNestDeluxe,
      quantity: 1,
      shipping: formatCurrency(STANDARD_SHIPPING_FEE),
    },
    {
      name: 'Apply free shipping when the subtotal exceeds $100',
      itemName: CATALOG_PRODUCT_NAMES.pawTrackSmartCollar,
      quantity: 2,
      shipping: 'Free',
    },
  ].forEach(({ name, itemName, quantity, shipping }) => {
    test(name, async ({ page, request }) => {
      const item = await fetchCatalogProduct(request, itemName);
      const subtotal = formatCurrency(item.price * quantity);
      const total = getExpectedTotal(item.price * quantity);

      // Given my cart contains the requested item quantity
      await seedCartState(page, [
        {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity,
          imgName: item.imgName,
        },
      ]);

      // When I open the cart from the navigation
      await openCartFromNavigation(page);

      // Then the subtotal matches the cart contents
      await expect(cart.subtotalValue(page)).toHaveText(subtotal);

      // And the shipping fee matches the subtotal threshold
      await expect(cart.shippingValue(page)).toHaveText(shipping);

      // And the total includes the expected shipping charge
      await expect(cart.totalValue(page)).toHaveText(total);
    });
  });

  test('Keep quantity at the minimum allowed value', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    // When I view the cart page
    await openCartFromNavigation(page);

    // Then the decrease quantity control for "PawTrack Smart Collar" is disabled
    await expect(cart.decreaseButton(page, product.name)).toBeDisabled();

    // And the line item quantity for "PawTrack Smart Collar" is 1
    await expect(cart.itemQuantity(page, product.productId)).toHaveText('1');
  });

  test('Remove an unavailable saved item', async ({ page }) => {
    // Given my saved cart contains an unavailable item
    await seedCartState(page, [
      {
        productId: LEGACY_UNAVAILABLE_PRODUCT.productId,
        name: LEGACY_UNAVAILABLE_PRODUCT.name,
        price: LEGACY_UNAVAILABLE_PRODUCT.price,
        quantity: 1,
        imgName: LEGACY_UNAVAILABLE_PRODUCT.imgName,
      },
    ]);

    // When I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then I see the message "\"Legacy Laser Toy\" is no longer available"
    const unavailableMessage = page.getByText(/legacy laser toy.*no longer available/i);
    await expect(unavailableMessage).toBeVisible();

    // And I can remove the unavailable item from the cart
    await cart.removeButton(page, LEGACY_UNAVAILABLE_PRODUCT.name).click();
    await expect(unavailableMessage).not.toBeVisible();
  });

  test('Handle a cart refresh network failure', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    // And the product catalog request fails because the network is unavailable
    await failAllCatalogRequests(page);

    // When I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then I see the message "We couldn't refresh your cart right now"
    await expect(cart.networkError(page)).toContainText("We couldn't refresh your cart right now");

    // And I am prompted to check my connection and try again
    await expect(cart.networkError(page)).toContainText(/check your connection and try again/i);

    // And the checkout button is disabled
    await expect(cart.checkoutButton(page)).toBeDisabled();

    // And I can retry loading the cart
    await expect(cart.retryButton(page)).toBeEnabled();
  });

  test('Retry a cart refresh after a network failure', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    // And the next product catalog request fails because the network is unavailable
    await failNextCatalogRequest(page);

    // When I open the cart from the navigation
    await openCartFromNavigation(page);

    // And I retry loading the cart after the network recovers
    await cart.retryButton(page).click();

    // Then the network failure message is dismissed
    await expect(cart.networkError(page)).not.toBeVisible();

    // And the cart contains the saved "PawTrack Smart Collar" entry
    await expect(cart.item(page, product.productId)).toContainText(product.name);
    await expect(cart.itemQuantity(page, product.productId)).toHaveText('1');

    // And the checkout button is enabled
    await expect(cart.checkoutButton(page)).toBeEnabled();
  });

  test('Adjust quantity using only the keyboard', async ({ page, request }) => {
    const product = await fetchCatalogProduct(request, CATALOG_PRODUCT_NAMES.pawTrackSmartCollar);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imgName: product.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I tab to the increase quantity control for "PawTrack Smart Collar"
    const increaseButton = cart.increaseButton(page, product.name);
    await tabToElement(page, increaseButton, `Increase quantity of ${product.name}`);
    await expect(increaseButton).toBeFocused();

    // And I press the Space key
    await page.keyboard.press('Space');

    // Then the line item quantity for "PawTrack Smart Collar" is 2
    await expect(cart.itemQuantity(page, product.productId)).toHaveText('2');

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText(getExpectedShippingLabel(product.price * 2));
  });
});
