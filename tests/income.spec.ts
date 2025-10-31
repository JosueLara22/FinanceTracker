import { test, expect } from '@playwright/test';

test.describe('Income Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); // Assuming your app runs on this port
    // Navigate to the Income page
    await page.click('text=Income');
    await expect(page).toHaveURL('http://localhost:5173/income');
  });

  test('should allow adding a new income entry', async ({ page }) => {
    // Click the 'Add New Income' button to open the form
    await page.getByRole('button', { name: 'Add New Income' }).click();

    // Fill the form
    await page.getByPlaceholder('Description').fill('Monthly salary');
    await page.getByPlaceholder('Amount (MXN)').fill('1500');
    await page.locator('input[type="date"]').fill('2023-10-26'); // Use a specific date for consistency
    await page.locator('select').first().selectOption('Salary'); // 'Salary' is an existing income category
    await page.getByPlaceholder('Source (e.g., Employer, Client)').fill('Employer');
    // Submit the form
    await page.locator('form').getByRole('button', { name: 'Add Income' }).click();
    await page.waitForLoadState('networkidle');

    // Verify the income appears in the list
    await expect(page.locator('.space-y-4').filter({ hasText: 'Monthly salary' })).toBeVisible();
    await expect(page.locator('.space-y-4').filter({ hasText: 'Salary' })).toBeVisible();
    await expect(page.locator('.space-y-4').filter({ hasText: 'octubre de 2023' })).toBeVisible(); // Adjust date format if needed
    await expect(page.locator('.space-y-4').filter({ hasText: '$1,500.00' })).toBeVisible();
  });

  test('should allow deleting an income entry', async ({ page }) => {
    // First, add an income entry to delete
    await page.getByRole('button', { name: 'Add New Income' }).click();
    await page.getByPlaceholder('Description').fill('Birthday gift');
    await page.getByPlaceholder('Amount (MXN)').fill('200');
    await page.locator('input[type="date"]').fill('2023-10-20');
    await page.locator('select').first().selectOption('Gifts'); // Changed from 'Gift' to 'Gifts'
    await page.getByPlaceholder('Source (e.g., Employer, Client)').fill('Family');
    await page.getByRole('button', { name: 'Add Income' }).click();
    await page.waitForLoadState('networkidle');

    // Verify it's added
    await expect(page.locator('.space-y-4').filter({ hasText: 'Birthday gift' })).toBeVisible();

    // Delete the income entry
    await page.locator('.space-y-4').filter({ hasText: 'Birthday gift' }).getByRole('button', { name: 'Delete' }).click();

    // Verify it's removed from the list
    await expect(page.locator('.space-y-4').filter({ hasText: 'Birthday gift' })).not.toBeVisible();
  });

  test('should update monthly cash flow on dashboard after adding income', async ({ page }) => {
    // Go to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('http://localhost:5173/');

    // Get initial cash flow
    const initialCashFlowText = await page.locator('p:has-text("Income - Expenses this month")').locator('..').locator('p.text-3xl').textContent();
    const initialCashFlow = parseFloat(initialCashFlowText?.replace(/[^0-9.-]+/g,'') || '0');

    // Click the 'Add Income' button on the Dashboard to open the form
    await page.getByRole('button', { name: 'Add Income' }).click();

    // Fill the form
    await page.getByPlaceholder('Description').fill('Project Payment'); // Changed description
    await page.getByPlaceholder('Amount (MXN)').fill('1000');
    await page.locator('input[type="date"]').fill('2023-10-27');
    await page.locator('select').first().selectOption('Freelance'); // Changed from 'Bonus' to 'Freelance'
    await page.getByPlaceholder('Source (e.g., Employer, Client)').fill('Client A'); // Changed source

    // Submit the form
    await page.locator('form').getByRole('button', { name: 'Add Income' }).click();
    await page.waitForLoadState('networkidle');

    // Go back to dashboard (form submission should close the modal and return to dashboard)
    // If the form submission doesn't automatically navigate, we might need to click 'Dashboard' again.
    // For now, assume it closes the modal and the dashboard is visible.

    // Get updated cash flow
    const updatedCashFlowText = await page.locator('p:has-text("Income - Expenses this month")').locator('..').locator('p.text-3xl').textContent();
    const updatedCashFlow = parseFloat(updatedCashFlowText?.replace(/[^0-9.-]+/g,'') || '0');

    // Verify cash flow increased by 1000
    expect(updatedCashFlow).toBeCloseTo(initialCashFlow + 1000);
  });
});
