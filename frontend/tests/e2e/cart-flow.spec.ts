import { test, expect } from '@playwright/test';

test.describe('Cart flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();
  });

  test('Add items from products and manage cart from cart page', async ({ page }) => {
    const firstProductQty = page.locator('[id^="qty-"]').first();
    const firstIncreaseButton = page.locator('[id^="increase-qty-"]').first();
    const firstAddButton = page.locator('[id^="add-to-cart-"]').first();

    await firstIncreaseButton.click();
    await expect(firstProductQty).toHaveText('1');
    await firstAddButton.click();

    await expect(page.locator('nav a:has-text("Cart") span')).toHaveText('1');

    await page.click('nav a:has-text("Cart")');
    await expect(page).toHaveURL(/\/cart/);

    await expect(page.locator('table[aria-label="Cart items"] tbody tr')).toHaveCount(1);

    const summary = page.locator('aside[aria-label="Order summary"]');
    await expect(summary).toContainText('Subtotal');
    await expect(summary).toContainText('Discount(5%)');
    await expect(summary).toContainText('Shipping');
    await expect(summary).toContainText('Grand Total');

    await page.click('button[aria-label^="Remove "]');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    await expect(page.locator('nav a:has-text("Cart") span')).toHaveCount(0);
  });
});
