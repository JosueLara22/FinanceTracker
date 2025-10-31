import { test, expect } from '@playwright/test';

test.describe('Edit Expense Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add a test expense to edit
    await page.click('text=Dashboard');
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Original Expense');
    await page.getByPlaceholder('0.00').fill('100');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');
    await page.locator('select').last().selectOption('Cash');
    await page.getByRole('button', { name: /Agregar Gasto/ }).click();
    await page.waitForTimeout(500);

    // Navigate to Expenses page
    await page.click('text=Expenses');
  });

  test('should open edit form with pre-filled data', async ({ page }) => {
    // Click Edit button
    await page.locator('button:has-text("Editar")').first().click();

    // Form should open with pre-filled data
    await expect(page.locator('h3:has-text("Editar Gasto")')).toBeVisible();
    await expect(page.getByPlaceholder('Ej: Compras en supermercado')).toHaveValue('Original Expense');
    await expect(page.getByPlaceholder('0.00')).toHaveValue('100');
  });

  test('should update expense successfully', async ({ page }) => {
    // Click Edit button
    await page.locator('button:has-text("Editar")').first().click();

    // Change the description and amount
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Updated Expense');
    await page.getByPlaceholder('0.00').fill('200');

    // Submit the form
    await page.getByRole('button', { name: 'Actualizar Gasto' }).click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify updated expense is displayed
    await expect(page.locator('text=Updated Expense')).toBeVisible();
    await expect(page.locator('text=$200.00')).toBeVisible();
    await expect(page.locator('text=Original Expense')).not.toBeVisible();
  });

  test('should cancel edit without saving', async ({ page }) => {
    // Click Edit button
    await page.locator('button:has-text("Editar")').first().click();

    // Change the description
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Should Not Save');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Original expense should still be displayed
    await expect(page.locator('text=Original Expense')).toBeVisible();
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });

  test('should update category and payment method', async ({ page }) => {
    // Click Edit button
    await page.locator('button:has-text("Editar")').first().click();

    // Change category and payment method
    await page.locator('select').first().selectOption('Transportation');
    await page.locator('select').last().selectOption('Credit Card');

    // Submit the form
    await page.getByRole('button', { name: 'Actualizar Gasto' }).click();
    await page.waitForTimeout(500);

    // Verify updated category and payment method
    await expect(page.locator('text=Transportation')).toBeVisible();
    await expect(page.locator('text=Credit Card')).toBeVisible();
  });
});
