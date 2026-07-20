import { test, expect, type Locator, type Page } from '@playwright/test';

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

const CART_STORAGE_KEY = 'octocat-cart';

const PRODUCTS = {
  pawTrackSmartCollar: {
    productId: 4,
    name: 'PawTrack Smart Collar',
    unitPrice: 79.99,
    imgName: 'smart-collar.png',
  },
  thermoNestDeluxe: {
    productId: 6,
    name: 'ThermoNest Deluxe',
    unitPrice: 99.99,
    imgName: 'sleep-nest.png',
  },
  legacyLaserToy: {
    productId: 9999,
    name: 'Legacy Laser Toy',
    unitPrice: 49.99,
    imgName: 'legacy-laser.png',
  },
} as const;

type ProductFixture = (typeof PRODUCTS)[keyof typeof PRODUCTS];

interface CartStorageItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imgName: string;
}

const cart = {
  navLink: (page: Page) => page.getByRole('link', { name: /cart/i }),
  badge: (page: Page) => page.getByTestId('cart-count-badge'),
  heading: (page: Page) => page.getByRole('heading', { name: 'Cart' }),
  emptyState: (page: Page) => page.getByRole('status'),
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

async function goToProductCatalog(page: Page) {
  await page.goto('/products');
  await expect(page.locator('h1:has-text("Products")')).toBeVisible();
}

async function addProductToCartFromCatalog(page: Page, product: ProductFixture, quantity: number) {
  await goToProductCatalog(page);

  const searchInput = page.locator('input[aria-label="Search products"]');
  await searchInput.fill(product.name);
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();

  for (let count = 0; count < quantity; count += 1) {
    await page.getByRole('button', { name: `Increase quantity of ${product.name}` }).click();
  }

  const addToCartButton = page.getByRole('button', {
    name: `Add ${quantity} ${product.name} to cart`,
  });
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
}

async function clearCartState(page: Page) {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
  await page.evaluate((storageKey) => window.localStorage.removeItem(storageKey), CART_STORAGE_KEY);
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
}

async function openCartFromNavigation(page: Page) {
  await cart.navLink(page).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(cart.heading(page)).toBeVisible();
}

async function tabToElement(page: Page, locator: Locator, attempts = 15) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await page.keyboard.press('Tab');
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }

  throw new Error('Unable to reach the requested element using keyboard navigation.');
}

test.describe('Cart page management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate away from about:blank so localStorage context is available.
    await page.goto('/');
  });

  test('View an empty cart', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

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

  test('Add products from the catalog and review the cart', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given I am viewing the product catalog
    await goToProductCatalog(page);

    // When I add 2 "PawTrack Smart Collar" items to my cart
    await addProductToCartFromCatalog(page, PRODUCTS.pawTrackSmartCollar, 2);

    // And I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then the cart icon shows 2 items
    await expect(cart.badge(page)).toHaveText('2');

    // And the cart contains 2 "PawTrack Smart Collar" items
    await expect(cart.item(page, PRODUCTS.pawTrackSmartCollar.productId)).toContainText(
      PRODUCTS.pawTrackSmartCollar.name,
    );
    await expect(cart.itemQuantity(page, PRODUCTS.pawTrackSmartCollar.productId)).toHaveText('2');

    // And the subtotal is "$159.98"
    await expect(cart.subtotalValue(page)).toHaveText(formatCurrency(159.98));

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText('Free');

    // And the total is "$159.98"
    await expect(cart.totalValue(page)).toHaveText(formatCurrency(159.98));
  });

  test('Update quantities from the cart page', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: PRODUCTS.pawTrackSmartCollar.productId,
        name: PRODUCTS.pawTrackSmartCollar.name,
        price: PRODUCTS.pawTrackSmartCollar.unitPrice,
        quantity: 1,
        imgName: PRODUCTS.pawTrackSmartCollar.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I increase the quantity of "PawTrack Smart Collar" to 2
    await cart.increaseButton(page, PRODUCTS.pawTrackSmartCollar.name).click();

    // Then the line item quantity for "PawTrack Smart Collar" is 2
    await expect(cart.itemQuantity(page, PRODUCTS.pawTrackSmartCollar.productId)).toHaveText('2');

    // And the line item total is "$159.98"
    await expect(cart.itemTotal(page, PRODUCTS.pawTrackSmartCollar.productId)).toHaveText(
      formatCurrency(159.98),
    );

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText('Free');

    // And the total is "$159.98"
    await expect(cart.totalValue(page)).toHaveText(formatCurrency(159.98));
  });

  test('Remove the final item from the cart', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: PRODUCTS.pawTrackSmartCollar.productId,
        name: PRODUCTS.pawTrackSmartCollar.name,
        price: PRODUCTS.pawTrackSmartCollar.unitPrice,
        quantity: 1,
        imgName: PRODUCTS.pawTrackSmartCollar.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I remove "PawTrack Smart Collar" from the cart
    await cart.removeButton(page, PRODUCTS.pawTrackSmartCollar.name).click();

    // Then I see the empty cart message "Your cart is empty"
    await expect(cart.emptyState(page)).toContainText('Your cart is empty');

    // And the cart icon shows 0 items
    await expect(cart.badge(page)).toHaveText('0');
  });

  [
    {
      name: 'Apply shipping when the subtotal stays under $100',
      item: PRODUCTS.thermoNestDeluxe,
      quantity: 1,
      subtotal: formatCurrency(99.99),
      shipping: formatCurrency(25),
      total: formatCurrency(124.99),
    },
    {
      name: 'Apply free shipping when the subtotal exceeds $100',
      item: PRODUCTS.pawTrackSmartCollar,
      quantity: 2,
      subtotal: formatCurrency(159.98),
      shipping: 'Free',
      total: formatCurrency(159.98),
    },
  ].forEach(({ name, item, quantity, subtotal, shipping, total }) => {
    test(name, async ({ page }) => {
      test.fixme(true, FUTURE_CART_REASON);

      // Given my cart contains the requested item quantity
      await seedCartState(page, [
        {
          productId: item.productId,
          name: item.name,
          price: item.unitPrice,
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

  test('Keep quantity at the minimum allowed value', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: PRODUCTS.pawTrackSmartCollar.productId,
        name: PRODUCTS.pawTrackSmartCollar.name,
        price: PRODUCTS.pawTrackSmartCollar.unitPrice,
        quantity: 1,
        imgName: PRODUCTS.pawTrackSmartCollar.imgName,
      },
    ]);

    // When I view the cart page
    await openCartFromNavigation(page);

    // Then the decrease quantity control for "PawTrack Smart Collar" is disabled
    await expect(cart.decreaseButton(page, PRODUCTS.pawTrackSmartCollar.name)).toBeDisabled();

    // And the line item quantity for "PawTrack Smart Collar" is 1
    await expect(cart.itemQuantity(page, PRODUCTS.pawTrackSmartCollar.productId)).toHaveText('1');
  });

  test('Remove an unavailable saved item', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given my saved cart contains an unavailable item
    await seedCartState(page, [
      {
        productId: PRODUCTS.legacyLaserToy.productId,
        name: PRODUCTS.legacyLaserToy.name,
        price: PRODUCTS.legacyLaserToy.unitPrice,
        quantity: 1,
        imgName: PRODUCTS.legacyLaserToy.imgName,
      },
    ]);

    // When I open the cart from the navigation
    await openCartFromNavigation(page);

    // Then I see the message "\"Legacy Laser Toy\" is no longer available"
    const unavailableMessage = page.getByText(/legacy laser toy.*no longer available/i);
    await expect(unavailableMessage).toBeVisible();

    // And I can remove the unavailable item from the cart
    await cart.removeButton(page, PRODUCTS.legacyLaserToy.name).click();
    await expect(unavailableMessage).not.toBeVisible();
  });

  test('Adjust quantity using only the keyboard', async ({ page }) => {
    test.fixme(true, FUTURE_CART_REASON);

    // Given my cart contains 1 "PawTrack Smart Collar"
    await seedCartState(page, [
      {
        productId: PRODUCTS.pawTrackSmartCollar.productId,
        name: PRODUCTS.pawTrackSmartCollar.name,
        price: PRODUCTS.pawTrackSmartCollar.unitPrice,
        quantity: 1,
        imgName: PRODUCTS.pawTrackSmartCollar.imgName,
      },
    ]);

    await openCartFromNavigation(page);

    // When I tab to the increase quantity control for "PawTrack Smart Collar"
    const increaseButton = cart.increaseButton(page, PRODUCTS.pawTrackSmartCollar.name);
    await tabToElement(page, increaseButton);
    await expect(increaseButton).toBeFocused();

    // And I press the Space key
    await page.keyboard.press('Space');

    // Then the line item quantity for "PawTrack Smart Collar" is 2
    await expect(cart.itemQuantity(page, PRODUCTS.pawTrackSmartCollar.productId)).toHaveText('2');

    // And the shipping fee is "Free"
    await expect(cart.shippingValue(page)).toHaveText('Free');
  });
});
