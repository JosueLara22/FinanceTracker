import { test, expect } from '@playwright/test';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const expenses = [
  { desc: 'Morning Coffee', amount: '50', date: today.toISOString().split('T')[0], category: 'Food', method: 'Cash' },
  { desc: 'Lunch', amount: '100', date: today.toISOString().split('T')[0], category: 'Food', method: 'Credit Card' },
  { desc: 'Gas', amount: '300', date: yesterday.toISOString().split('T')[0], category: 'Transportation', method: 'Debit Card' },
];

test.describe('Expense Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add a bank account for the form
    await page.click('a[href="/accounts"]');
    await page.click('button:has-text("Bank Accounts")');
    await page.click('button:has-text("Add Bank Account")');
    await page.fill('input[id="bank"]', 'Test Bank');
    await page.fill('input[id="accountNumber"]', '1234');
    await page.fill('input[id="balance"]', '10000');
    await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(500);

    // Add a credit card for the form
    await page.click('button:has-text("Credit Cards")');
    await page.click('button:has-text("Add Credit Card")');
    await page.fill('input[id="bank"]', 'Test Card');
    await page.fill('input[id="cardName"]', 'Test Card');
    await page.fill('input[id="lastFourDigits"]', '4321');
    await page.fill('input[id="creditLimit"]', '20000');
    await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(500);

    for (const expense of expenses) {
      await page.click('text=Dashboard');
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Ej: Compras en supermercado').fill(expense.desc);
      await page.getByPlaceholder('0.00').fill(expense.amount);
      await page.locator('input[type="date"]').fill(expense.date);
      await page.locator('select').first().selectOption(expense.category);
      await page.locator('select').last().selectOption({ label: expense.method });
      if (expense.method === 'Debit Card' || expense.method === 'Credit Card') {
        await page.waitForSelector('select[id="accountId"]');
        await page.waitForFunction(() => document.querySelector('select[id="accountId"]')?.options.length > 1);
        await page.locator('select[id="accountId"]').selectOption({ index: 1 });
      }
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(500);
    }

    await page.click('text=Expenses');
    await page.click('button:has-text("Calendario")');
    await page.waitForSelector('[data-testid="expense-calendar"]');
  });

  test('should display calendar view', async ({ page }) => {
    await expect(page.getByTestId('calendar-grid')).toBeVisible();
    await expect(page.locator('text=Dom')).toBeVisible();
    await expect(page.locator('text=Lun')).toBeVisible();
  });

  test('should show expenses on calendar days', async ({ page }) => {
    const todayCell = page.getByTestId(`calendar-day-${today.toISOString().split('T')[0]}`);
    await expect(todayCell).toContainText('$150.00');
    await expect(todayCell).toContainText('2 gastos');

    const yesterdayCell = page.getByTestId(`calendar-day-${yesterday.toISOString().split('T')[0]}`);
    await expect(yesterdayCell).toContainText('$300.00');
    await expect(yesterdayCell).toContainText('1 gasto');
  });

  test('should navigate between months', async ({ page }) => {
    const currentMonth = await page.getByTestId('calendar-month-year').textContent();

    await page.getByTestId('next-month-button').click();
    await page.waitForTimeout(300);

    const nextMonth = await page.getByTestId('calendar-month-year').textContent();
    expect(nextMonth).not.toBe(currentMonth);

    await page.getByTestId('prev-month-button').click();
    await page.waitForTimeout(300);

    const prevMonth = await page.getByTestId('calendar-month-year').textContent();
    expect(prevMonth).not.toBe(nextMonth);
  });

  test('should go to today', async ({ page }) => {
    await page.getByTestId('next-month-button').click();
    await page.waitForTimeout(300);

    await page.getByTestId('today-button').click();
    await page.waitForTimeout(300);

    const monthName = today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    await expect(page.getByTestId('calendar-month-year')).toContainText(monthName);
  });

  test('should show expense details when clicking a day', async ({ page }) => {
    const todayCell = page.getByTestId(`calendar-day-${today.toISOString().split('T')[0]}`);
    await todayCell.click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=Gastos del día seleccionado')).toBeVisible();
    await expect(page.locator('text=Morning Coffee')).toBeVisible();
    await expect(page.locator('text=Lunch')).toBeVisible();
  });
});