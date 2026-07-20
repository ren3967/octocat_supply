import { expect, test } from '@playwright/test';

const normalizeText = (value: string | null) => (value ?? '').replace(/\s+/g, ' ').trim();

test.describe('Cart workflow', () => {
  test('Add products, persist the cart, and update shipping totals', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();

    const firstProductName = normalizeText(await page.locator('h3').first().textContent());

    await page.locator('button[id^="increase-qty-"]').first().click();
    await page.locator('button[id^="add-to-cart-"]').first().click();

    const cartLink = page.locator('nav a[href="/cart"]').first();
    await expect(cartLink.locator('span')).toHaveText('1');
    await cartLink.click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();

    const cartItem = page.locator('article').filter({ hasText: firstProductName }).first();
    await expect(cartItem).toBeVisible();

    await page.reload();
    await expect(page.locator('article').filter({ hasText: firstProductName }).first()).toBeVisible();

    const itemText = normalizeText(await cartItem.textContent());
    const unitPrice = Number(itemText.match(/Unit price\s*\$([0-9]+\.[0-9]{2})/)?.[1] ?? '0');
    expect(unitPrice).toBeGreaterThan(0);
    const quantityForFreeShipping = unitPrice > 0 ? Math.floor(100 / unitPrice) + 1 : 1;

    await expect(page.locator('aside')).toContainText(unitPrice > 100 ? 'Free' : '$25.00');

    const incrementButton = cartItem.getByRole('button', {
      name: `Increase quantity of ${firstProductName}`,
    });
    for (let quantity = 1; quantity < quantityForFreeShipping; quantity += 1) {
      await incrementButton.click();
    }

    await expect(page.locator('nav a[href="/cart"] span')).toHaveText(String(quantityForFreeShipping));
    await expect(page.locator('aside')).toContainText('Free');
    await expect(page.locator('aside')).toContainText('You unlocked free shipping.');

    await cartItem.getByRole('button', { name: 'Remove' }).click();

    await expect(page.locator('h1:has-text("Your cart is empty")')).toBeVisible();
    await expect(page.locator('aside')).toHaveCount(0);
  });
});
