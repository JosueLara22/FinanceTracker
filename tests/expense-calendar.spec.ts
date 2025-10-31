import { test, expect } from '@playwright/test';

test.describe('Expense Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add test expenses on different days
    const expenses = [
      { desc: 'Morning Coffee', amount: '50', date: '2024-10-15', category: 'Food', method: 'Cash' },
      { desc: 'Lunch', amount: '100', date: '2024-10-15', category: 'Food', method: 'Credit Card' },
      { desc: 'Gas', amount: '300', date: '2024-10-20', category: 'Transportation', method: 'Debit Card' },
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

    // Navigate to Expenses page and switch to Calendar tab
    await page.click('text=Expenses');
    await page.click('button:has-text("Calendario")');
  });

  test('should display calendar view', async ({ page }) => {
    // Calendar should be visible
    await expect(page.locator('.grid.grid-cols-7')).toBeVisible();

    // Week day headers should be visible
    await expect(page.locator('text=Dom')).toBeVisible();
    await expect(page.locator('text=Lun')).toBeVisible();
    await expect(page.locator('text=Mar')).toBeVisible();
    await expect(page.locator('text=Mié')).toBeVisible();
    await expect(page.locator('text=Jue')).toBeVisible();
    await expect(page.locator('text=Vie')).toBeVisible();
    await expect(page.locator('text=Sáb')).toBeVisible();
  });

  test('should show expenses on calendar days', async ({ page }) => {
    // Days with expenses should show totals
    // Note: This test assumes we can see October 2024
    // The calendar should show $150 on Oct 15 (50 + 100)
    const oct15Cell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: '15' }).first();
    await expect(oct15Cell).toContainText('$150.00');
    await expect(oct15Cell).toContainText('2 gastos');

    // Oct 20 should show $300
    const oct20Cell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: '20' }).first();
    await expect(oct20Cell).toContainText('$300.00');
    await expect(oct20Cell).toContainText('1 gasto');
  });

  test('should navigate between months', async ({ page }) => {
    // Get current month
    const currentMonth = await page.locator('h2.text-xl').textContent();

    // Click next month
    await page.locator('button:has-text("→")').click();
    await page.waitForTimeout(300);

    // Month should change
    const nextMonth = await page.locator('h2.text-xl').textContent();
    expect(nextMonth).not.toBe(currentMonth);

    // Click previous month twice
    await page.locator('button:has-text("←")').click();
    await page.waitForTimeout(300);

    // Should be back to original or earlier month
    const prevMonth = await page.locator('h2.text-xl').textContent();
    expect(prevMonth).not.toBe(nextMonth);
  });

  test('should go to today', async ({ page }) => {
    // Navigate to a different month
    await page.locator('button:has-text("→")').click();
    await page.waitForTimeout(300);

    // Click "Hoy" button
    await page.locator('button:has-text("Hoy")').click();
    await page.waitForTimeout(300);

    // Should show current month
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    await expect(page.locator(`h2:has-text("${monthName}")`)).toBeVisible();
  });

  test('should show expense details when clicking a day', async ({ page }) => {
    // Click on Oct 15 (has 2 expenses)
    const oct15Cell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: '15' }).first();
    await oct15Cell.click();
    await page.waitForTimeout(300);

    // Expense details panel should appear
    await expect(page.locator('text=Gastos del día seleccionado')).toBeVisible();
    await expect(page.locator('text=Morning Coffee')).toBeVisible();
    await expect(page.locator('text=Lunch')).toBeVisible();
  });

  test('should close day details panel', async ({ page }) => {
    // Click on a day with expenses
    const oct15Cell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: '15' }).first();
    await oct15Cell.click();
    await page.waitForTimeout(300);

    // Details should be visible
    await expect(page.locator('text=Gastos del día seleccionado')).toBeVisible();

    // Click close button
    await page.locator('button:has-text("Cerrar")').click();
    await page.waitForTimeout(300);

    // Details should be hidden
    await expect(page.locator('text=Gastos del día seleccionado')).not.toBeVisible();
  });

  test('should allow editing expense from calendar day details', async ({ page }) => {
    // Click on a day with expenses
    const oct15Cell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: '15' }).first();
    await oct15Cell.click();
    await page.waitForTimeout(300);

    // Click edit on first expense
    await page.locator('button:has-text("Editar")').first().click();

    // Edit form should open
    await expect(page.locator('h3:has-text("Editar Gasto")')).toBeVisible();
  });

  test('should highlight today on calendar', async ({ page }) => {
    // Today's cell should have a ring (highlighted)
    const today = new Date().getDate().toString();
    const todayCell = page.locator('.grid.grid-cols-7 > div').filter({ hasText: new RegExp(`^${today}$`) });

    // Check if today's date has the ring class (may not always be visible depending on month)
    const todayCellCount = await todayCell.count();
    if (todayCellCount > 0) {
      const className = await todayCell.first().getAttribute('class');
      expect(className).toContain('ring');
    }
  });
});
