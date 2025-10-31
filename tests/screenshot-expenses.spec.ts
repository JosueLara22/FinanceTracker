import { test, expect } from '@playwright/test';

test.describe('Screenshot: Expense Type Contrast', () => {
  test('capture expenses page to check category contrast', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add multiple expenses with different categories to check contrast
    const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health'];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < categories.length; i++) {
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill(`${categories[i]} expense ${i + 1}`);
      await page.getByPlaceholder('Amount (MXN)').fill(`${(i + 1) * 100}`);
      await page.locator('input[type="date"]').fill(today);
      await page.locator('select').nth(0).selectOption(categories[i]);
      await page.locator('select').nth(1).selectOption('Debit Card');
      await page.locator('form').getByRole('button', { name: 'Add Expense' }).click();

      // Wait for modal to close
      await page.locator('.fixed.inset-0.bg-black').waitFor({ state: 'hidden' });
      await page.waitForTimeout(300);
    }

    // Navigate to Expenses page
    await page.click('text=Expenses');
    await expect(page).toHaveURL('http://localhost:5173/expenses');

    // Wait for expenses to load
    await page.waitForTimeout(1000);

    // Take a full page screenshot
    await page.screenshot({
      path: 'expense-types-contrast.png',
      fullPage: true
    });

    console.log('Screenshot saved as: expense-types-contrast.png');
  });
});
