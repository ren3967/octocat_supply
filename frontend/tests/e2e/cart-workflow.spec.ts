import { expect, test } from '@playwright/test';
import { FREE_SHIPPING_THRESHOLD } from '../../src/utils/cart';

const normalizeText = (value: string | null) => (value ?? '').replace(/\s+/g, ' ').trim();

test.describe('Cart workflow', () => {
  test('Add products, persist the cart, and update shipping totals', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();

    const firstProductName = normalizeText(await page.locator('h3').first().textContent());

    await page.locator('button[id^="increase-qty-"]').first().click();
    await page.locator('button[id^="add-to-cart-"]').first().click();

    const cartLink = page.locator('nav a[href="/cart"]').first();
    await expect(page.getByTestId('cart-item-count')).toHaveText('1');
    await cartLink.click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();

    const cartItem = page.locator('article').filter({ hasText: firstProductName }).first();
    await expect(cartItem).toBeVisible();

    await page.reload();
    await expect(page.locator('article').filter({ hasText: firstProductName }).first()).toBeVisible();

    const unitPriceText = normalizeText(
      await cartItem.getByTestId('cart-item-unit-price').textContent(),
    );
    const unitPrice = Number(unitPriceText.replace(/[^0-9.]/g, ''));
    expect(unitPrice).toBeGreaterThan(0);
    const quantityForFreeShipping =
      unitPrice > 0 ? Math.floor(FREE_SHIPPING_THRESHOLD / unitPrice) + 1 : 1;

    await expect(page.getByTestId('cart-summary-shipping')).toHaveText(
      unitPrice > 100 ? 'Free' : '$25.00',
    );

    const incrementButton = cartItem.getByRole('button', {
      name: `Increase quantity of ${firstProductName}`,
    });
    for (let quantity = 1; quantity < quantityForFreeShipping; quantity += 1) {
      await incrementButton.click();
    }

    await expect(page.getByTestId('cart-item-count')).toHaveText(String(quantityForFreeShipping));
    await expect(page.getByTestId('cart-summary-shipping')).toHaveText('Free');
    await expect(page.locator('aside')).toContainText('You unlocked free shipping.');

    await cartItem.getByRole('button', { name: 'Remove' }).click();

    await expect(page.locator('h1:has-text("Your cart is empty")')).toBeVisible();
    await expect(page.locator('aside')).toHaveCount(0);
  });
});
