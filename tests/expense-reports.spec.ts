import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Expense Reports and Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add multiple expenses for meaningful reports
    const expenses = [
      { desc: 'Grocery 1', amount: '500', date: '2024-10-01', category: 'Food', method: 'Cash' },
      { desc: 'Grocery 2', amount: '600', date: '2024-10-05', category: 'Food', method: 'Credit Card' },
      { desc: 'Gas 1', amount: '300', date: '2024-10-10', category: 'Transportation', method: 'Debit Card' },
      { desc: 'Gas 2', amount: '400', date: '2024-10-15', category: 'Transportation', method: 'Debit Card' },
      { desc: 'Movie', amount: '200', date: '2024-10-20', category: 'Entertainment', method: 'Credit Card' },
      { desc: 'Concert', amount: '800', date: '2024-10-25', category: 'Entertainment', method: 'Cash' },
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

    // Navigate to Expenses page and switch to Reports tab
    await page.click('text=Expenses');
    await page.click('button:has-text("Reportes")');
  });

  test('should display summary cards', async ({ page }) => {
    // Summary cards should be visible
    await expect(page.locator('text=Total de Gastos')).toBeVisible();
    await expect(page.locator('text=Promedio por Gasto')).toBeVisible();
    await expect(page.locator('text=Este Mes')).toBeVisible();
    await expect(page.locator('text=Mes Anterior')).toBeVisible();

    // Total should be sum of all expenses (2800)
    await expect(page.locator('text=$2,800.00')).toBeVisible();

    // Transaction count should be visible
    await expect(page.locator('text=6 transacciones')).toBeVisible();
  });

  test('should display top categories', async ({ page }) => {
    // Top 5 Categories section should be visible
    await expect(page.locator('h3:has-text("Top 5 Categorías")')).toBeVisible();

    // Categories should be listed
    await expect(page.locator('text=Food')).toBeVisible();
    await expect(page.locator('text=Transportation')).toBeVisible();
    await expect(page.locator('text=Entertainment')).toBeVisible();

    // Progress bars should be visible
    const progressBars = page.locator('.bg-primary-DEFAULT.h-2.rounded-full');
    await expect(progressBars.first()).toBeVisible();
  });

  test('should display payment method breakdown', async ({ page }) => {
    // Payment method section should be visible
    await expect(page.locator('h3:has-text("Por Método de Pago")')).toBeVisible();

    // Payment methods should be listed
    await expect(page.locator('text=Credit Card')).toBeVisible();
    await expect(page.locator('text=Cash')).toBeVisible();
    await expect(page.locator('text=Debit Card')).toBeVisible();
  });

  test('should display monthly breakdown', async ({ page }) => {
    // Monthly breakdown section should be visible
    await expect(page.locator('h3:has-text("Últimos 6 Meses")')).toBeVisible();

    // Current month should be visible with expenses
    const currentMonth = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
  });

  test('should display additional statistics', async ({ page }) => {
    // Additional statistics section should be visible
    await expect(page.locator('h3:has-text("Estadísticas Adicionales")')).toBeVisible();

    // Statistics should be visible
    await expect(page.locator('text=Gasto Más Alto')).toBeVisible();
    await expect(page.locator('text=Gasto Más Bajo')).toBeVisible();
    await expect(page.locator('text=Métodos de Pago Usados')).toBeVisible();

    // Highest expense should be $800
    await expect(page.locator('text=$800.00').first()).toBeVisible();

    // Lowest expense should be $200
    await expect(page.locator('text=$200.00').first()).toBeVisible();
  });

  test('should show export buttons', async ({ page }) => {
    // Export buttons should be visible
    await expect(page.getByRole('button', { name: 'Exportar a CSV' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exportar a JSON' })).toBeVisible();
  });

  test('should trigger CSV download', async ({ page, context }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click CSV export button
    await page.getByRole('button', { name: 'Exportar a CSV' }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download.suggestedFilename()).toContain('gastos_');
  });

  test('should trigger JSON download', async ({ page, context }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click JSON export button
    await page.getByRole('button', { name: 'Exportar a JSON' }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('.json');
    expect(download.suggestedFilename()).toContain('gastos_');
  });

  test('should show month-over-month comparison', async ({ page }) => {
    // Month comparison should be visible in "Este Mes" card
    const thiMonthCard = page.locator('text=Este Mes').locator('..');

    // Should show percentage change indicator (↑ or ↓)
    await expect(thisMonthCard.locator('text=/[↑↓]/')).toBeVisible();
    await expect(thisMonthCard.locator('text=/vs mes anterior/')).toBeVisible();
  });

  test('should show empty state when no expenses', async ({ page }) => {
    // Delete all expenses first
    await page.click('button:has-text("Lista")');

    // Delete each expense
    const deleteButtons = page.locator('button:has-text("Eliminar")');
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await page.locator('button:has-text("Eliminar")').first().click();
      await page.locator('button:has-text("OK")').click();
      await page.waitForTimeout(300);
    }

    // Go back to reports
    await page.click('button:has-text("Reportes")');

    // Empty state should be shown
    await expect(page.locator('text=No hay datos suficientes para generar reportes')).toBeVisible();
  });

  test('reports should respect filters from list view', async ({ page }) => {
    // Go to list view
    await page.click('button:has-text("Lista")');

    // Apply a category filter
    await page.click('text=Filtros Avanzados');
    await page.locator('button:has-text("Food")').click();

    // Go back to reports
    await page.click('button:has-text("Reportes")');

    // Reports should only show Food expenses (1100)
    await expect(page.locator('text=$1,100.00')).toBeVisible();
    await expect(page.locator('text=2 transacciones')).toBeVisible();
  });
});
