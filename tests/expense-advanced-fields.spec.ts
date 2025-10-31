import { test, expect } from '@playwright/test';

test.describe('Subcategories and Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('text=Expenses');
    await page.getByRole('button', { name: 'Agregar Gasto' }).click();
  });

  test('should add expense with subcategory', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Lunch at Restaurant');
    await page.getByPlaceholder('0.00').fill('150');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');

    // Add subcategory
    const subcategoryInput = page.locator('label:has-text("Subcategoría") ~ input, label:has-text("Subcategoría") ~ select');
    await subcategoryInput.fill('Restaurant');

    // Select payment method
    await page.locator('select').last().selectOption('Credit Card');

    // Submit
    await page.getByRole('button', { name: /Agregar Gasto/ }).click();
    await page.waitForTimeout(500);

    // Verify expense with subcategory is displayed
    await expect(page.locator('text=Lunch at Restaurant')).toBeVisible();
    await expect(page.locator('text=Restaurant')).toBeVisible();
  });

  test('should add expense with tags', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Business Meeting');
    await page.getByPlaceholder('0.00').fill('200');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');
    await page.locator('select').last().selectOption('Credit Card');

    // Add tags
    const tagInput = page.getByPlaceholder('Agregar etiqueta');
    await tagInput.fill('work');
    await page.getByRole('button', { name: 'Agregar' }).click();

    await tagInput.fill('tax-deductible');
    await page.getByRole('button', { name: 'Agregar' }).click();

    // Verify tags are shown in form
    await expect(page.locator('text=#work')).toBeVisible();
    await expect(page.locator('text=#tax-deductible')).toBeVisible();

    // Submit
    await page.getByRole('button', { name: /Agregar Gasto/ }).click();
    await page.waitForTimeout(500);

    // Verify expense with tags is displayed
    await expect(page.locator('text=Business Meeting')).toBeVisible();
    await expect(page.locator('text=#work')).toBeVisible();
    await expect(page.locator('text=#tax-deductible')).toBeVisible();
  });

  test('should add tag by pressing Enter', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Test Expense');
    await page.getByPlaceholder('0.00').fill('100');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');
    await page.locator('select').last().selectOption('Cash');

    // Add tag by pressing Enter
    const tagInput = page.getByPlaceholder('Agregar etiqueta');
    await tagInput.fill('urgent');
    await tagInput.press('Enter');

    // Tag should be added
    await expect(page.locator('text=#urgent')).toBeVisible();

    // Input should be cleared
    await expect(tagInput).toHaveValue('');
  });

  test('should remove tag', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Test Expense');
    await page.getByPlaceholder('0.00').fill('100');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');
    await page.locator('select').last().selectOption('Cash');

    // Add tags
    const tagInput = page.getByPlaceholder('Agregar etiqueta');
    await tagInput.fill('tag1');
    await page.getByRole('button', { name: 'Agregar' }).click();
    await tagInput.fill('tag2');
    await page.getByRole('button', { name: 'Agregar' }).click();

    // Remove first tag
    await page.locator('text=#tag1').locator('..').locator('button:has-text("×")').click();

    // First tag should be removed
    await expect(page.locator('text=#tag1')).not.toBeVisible();
    await expect(page.locator('text=#tag2')).toBeVisible();
  });

  test('should mark expense as recurring', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Monthly Subscription');
    await page.getByPlaceholder('0.00').fill('50');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Entertainment');
    await page.locator('select').last().selectOption('Credit Card');

    // Check recurring checkbox
    await page.locator('label:has-text("Gasto recurrente")').click();

    // Submit
    await page.getByRole('button', { name: /Agregar Gasto/ }).click();
    await page.waitForTimeout(500);

    // Verify expense is added
    await expect(page.locator('text=Monthly Subscription')).toBeVisible();
  });

  test('should add expense with subcategory and tags combined', async ({ page }) => {
    // Fill basic fields
    await page.getByPlaceholder('Ej: Compras en supermercado').fill('Team Lunch');
    await page.getByPlaceholder('0.00').fill('500');
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(today);
    await page.locator('select').first().selectOption('Food');

    // Add subcategory
    const subcategoryInput = page.locator('label:has-text("Subcategoría") ~ input, label:has-text("Subcategoría") ~ select');
    await subcategoryInput.fill('Restaurant');

    // Add tags
    const tagInput = page.getByPlaceholder('Agregar etiqueta');
    await tagInput.fill('team');
    await tagInput.press('Enter');
    await tagInput.fill('company');
    await tagInput.press('Enter');

    // Select payment method
    await page.locator('select').last().selectOption('Credit Card');

    // Mark as recurring
    await page.locator('label:has-text("Gasto recurrente")').click();

    // Submit
    await page.getByRole('button', { name: /Agregar Gasto/ }).click();
    await page.waitForTimeout(500);

    // Verify all fields are displayed
    await expect(page.locator('text=Team Lunch')).toBeVisible();
    await expect(page.locator('text=Restaurant')).toBeVisible();
    await expect(page.locator('text=#team')).toBeVisible();
    await expect(page.locator('text=#company')).toBeVisible();
  });
});
