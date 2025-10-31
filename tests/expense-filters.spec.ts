import { test, expect } from '@playwright/test';

test.describe('Expense Filters and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add multiple test expenses with different properties
    const expenses = [
      { desc: 'Grocery Shopping', amount: '500', category: 'Food', method: 'Debit Card', date: '2024-10-01' },
      { desc: 'Gas Station', amount: '300', category: 'Transportation', method: 'Credit Card', date: '2024-10-15' },
      { desc: 'Restaurant Dinner', amount: '800', category: 'Food', method: 'Cash', date: '2024-10-20' },
      { desc: 'Movie Tickets', amount: '200', category: 'Entertainment', method: 'Credit Card', date: '2024-10-25' },
    ];

    for (const expense of expenses) {
      await page.click('text=Dashboard');
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Ej: Compras en supermercado').fill(expense.desc);
      await page.getByPlaceholder('0.00').fill(expense.amount);
      await page.locator('input[type="date"]').fill(expense.date);
      await page.locator('select').first().selectOption(expense.category);
      await page.locator('select').last().selectOption(expense.method);
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(500);
    }

    // Navigate to Expenses page
    await page.click('text=Expenses');
  });

  test('should filter expenses by search term', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder('Buscar por descripción, categoría...').fill('Grocery');

    // Should show only the grocery expense
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Gas Station')).not.toBeVisible();
    await expect(page.locator('text=Restaurant Dinner')).not.toBeVisible();

    // Counter should update
    await expect(page.locator('text=/1 de \\d+ gasto/')).toBeVisible();
  });

  test('should filter expenses by category', async ({ page }) => {
    // Open advanced filters
    await page.click('text=Filtros Avanzados');

    // Click Food category filter
    await page.locator('button:has-text("Food")').click();

    // Should show only Food expenses
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Restaurant Dinner')).toBeVisible();
    await expect(page.locator('text=Gas Station')).not.toBeVisible();

    // Active filters summary should be visible
    await expect(page.locator('text=Filtros activos:')).toBeVisible();
    await expect(page.locator('text=/1 categoría/')).toBeVisible();
  });

  test('should filter expenses by payment method', async ({ page }) => {
    // Open advanced filters
    await page.click('text=Filtros Avanzados');

    // Click Credit Card payment method
    await page.locator('button:has-text("Credit Card")').click();

    // Should show only Credit Card expenses
    await expect(page.locator('text=Gas Station')).toBeVisible();
    await expect(page.locator('text=Movie Tickets')).toBeVisible();
    await expect(page.locator('text=Grocery Shopping')).not.toBeVisible();
  });

  test('should filter expenses by date range', async ({ page }) => {
    // Open advanced filters
    await page.click('text=Filtros Avanzados');

    // Set date range
    await page.locator('label:has-text("Desde") + input[type="date"]').fill('2024-10-10');
    await page.locator('label:has-text("Hasta") + input[type="date"]').fill('2024-10-20');

    // Should show only expenses in that range
    await expect(page.locator('text=Gas Station')).toBeVisible();
    await expect(page.locator('text=Restaurant Dinner')).toBeVisible();
    await expect(page.locator('text=Grocery Shopping')).not.toBeVisible();
    await expect(page.locator('text=Movie Tickets')).not.toBeVisible();
  });

  test('should use quick date filters', async ({ page }) => {
    // Click "Este Mes" quick filter
    await page.click('button:has-text("Este Mes")');

    // Should filter to current month
    await expect(page.locator('text=Filtros activos:')).toBeVisible();
    await expect(page.locator('text=Rango de fechas')).toBeVisible();
  });

  test('should filter by amount range', async ({ page }) => {
    // Open advanced filters
    await page.click('text=Filtros Avanzados');

    // Set amount range
    await page.locator('label:has-text("Monto Mínimo") + input').fill('300');
    await page.locator('label:has-text("Monto Máximo") + input').fill('600');

    // Should show only expenses in that amount range
    await expect(page.locator('text=Grocery Shopping')).toBeVisible(); // 500
    await expect(page.locator('text=Gas Station')).toBeVisible(); // 300
    await expect(page.locator('text=Restaurant Dinner')).not.toBeVisible(); // 800
    await expect(page.locator('text=Movie Tickets')).not.toBeVisible(); // 200
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters
    await page.getByPlaceholder('Buscar por descripción, categoría...').fill('Grocery');
    await page.click('text=Filtros Avanzados');
    await page.locator('button:has-text("Food")').click();

    // Clear filters
    await page.click('button:has-text("Limpiar Filtros")');

    // Search box should be empty
    await expect(page.getByPlaceholder('Buscar por descripción, categoría...')).toHaveValue('');

    // All expenses should be visible
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Gas Station')).toBeVisible();
    await expect(page.locator('text=Restaurant Dinner')).toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    // Search + Category filter
    await page.getByPlaceholder('Buscar por descripción, categoría...').fill('Food');
    await page.click('text=Filtros Avanzados');
    await page.locator('button:has-text("Cash")').click();

    // Should show only Food expenses paid with Cash
    await expect(page.locator('text=Restaurant Dinner')).toBeVisible();
    await expect(page.locator('text=Grocery Shopping')).not.toBeVisible();

    // Multiple filters should show in summary
    await expect(page.locator('text=Búsqueda: Food')).toBeVisible();
    await expect(page.locator('text=/1 método/')).toBeVisible();
  });
});
