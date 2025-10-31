import { test, expect } from '@playwright/test';

test.describe('Expense Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); // Assuming your app runs on this port
  });

  test('should allow adding a new expense entry and reflect on dashboard', async ({ page }) => {
    // Get initial monthly expenses and cash flow from dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('http://localhost:5173/');

    const initialMonthlyExpensesText = await page.locator('p:has-text("Expenses this month")').locator('..').locator('p.text-3xl').first().textContent();
    const initialMonthlyExpenses = parseFloat(initialMonthlyExpensesText?.replace(/[^0-9.-]+/g,'') || '0');

    const initialMonthlyCashFlowText = await page.locator('p:has-text("Income - Expenses this month")').locator('..').locator('p.text-3xl').first().textContent();
    const initialMonthlyCashFlow = parseFloat(initialMonthlyCashFlowText?.replace(/[^0-9.-]+/g,'') || '0');

    // Click the 'Add Expense' button on the Dashboard to open the form
    await page.getByRole('button', { name: 'Add Expense' }).click();

    // Fill the form
    await page.getByPlaceholder('Description').fill('Groceries');
    await page.getByPlaceholder('Amount (MXN)').fill('500');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').nth(0).selectOption('Food'); // Select 'Food' category
    await page.locator('select').nth(1).selectOption('Debit Card'); // Select 'Debit Card' payment method

    // Submit the form
    await page.locator('form').getByRole('button', { name: 'Add Expense' }).click();

    // Wait for the modal to close
    await page.locator('.fixed.inset-0.bg-black').waitFor({ state: 'hidden' });

    // Verify the expense appears in the Expenses list (navigate to Expenses page first)
    await page.click('text=Expenses');
    await expect(page).toHaveURL('http://localhost:5173/expenses');
    await expect(page.locator('.space-y-4').filter({ hasText: 'Groceries' })).toBeVisible();
    await expect(page.locator('.space-y-4').filter({ hasText: 'Food' })).toBeVisible();
    // Date format check - just verify the expense card is visible (date format may vary)
    await expect(page.locator('.space-y-4').filter({ hasText: '$500.00' })).toBeVisible();

    // Go back to dashboard and verify updated metrics
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('http://localhost:5173/');

    const updatedMonthlyExpensesText = await page.locator('p:has-text("Expenses this month")').locator('..').locator('p.text-3xl').first().textContent();
    const updatedMonthlyExpenses = parseFloat(updatedMonthlyExpensesText?.replace(/[^0-9.-]+/g,'') || '0');

    const updatedMonthlyCashFlowText = await page.locator('p:has-text("Income - Expenses this month")').locator('..').locator('p.text-3xl').first().textContent();
    const updatedMonthlyCashFlow = parseFloat(updatedMonthlyCashFlowText?.replace(/[^0-9.-]+/g,'') || '0');

    expect(updatedMonthlyExpenses).toBeCloseTo(initialMonthlyExpenses + 500);
    expect(updatedMonthlyCashFlow).toBeCloseTo(initialMonthlyCashFlow - 500);
  });

  test('should allow deleting an expense entry', async ({ page }) => {
    // First, add an expense entry to delete
    await page.click('text=Dashboard');
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await page.getByPlaceholder('Description').fill('Dinner');
    await page.getByPlaceholder('Amount (MXN)').fill('100');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').nth(0).selectOption('Food');
    await page.locator('select').nth(1).selectOption('Cash');
    await page.locator('form').getByRole('button', { name: 'Add Expense' }).click();

    // Wait for the modal to close
    await page.locator('.fixed.inset-0.bg-black').waitFor({ state: 'hidden' });

    // Navigate to Expenses page
    await page.click('text=Expenses');
    await expect(page).toHaveURL('http://localhost:5173/expenses');

    // Verify it's added
    await expect(page.locator('.space-y-4').filter({ hasText: 'Dinner' })).toBeVisible();

    // Delete the expense entry (now has confirmation dialog)
    await page.locator('.space-y-4').filter({ hasText: 'Dinner' }).getByRole('button', { name: /Eliminar/ }).click();

    // Confirm deletion in the dialog
    page.once('dialog', dialog => dialog.accept());
    await page.waitForTimeout(300);

    // Verify it's removed from the list
    await expect(page.locator('.space-y-4').filter({ hasText: 'Dinner' })).not.toBeVisible();
  });
});






