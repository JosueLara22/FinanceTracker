import { test, expect } from '@playwright/test';

test.describe('Transaction System - Phase 4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Transaction Creation from Expense', () => {
    test('should create a transaction when an expense is added with bank account', async ({ page }) => {
      // Add a bank account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Test Bank');
      await page.fill('input[id="accountNumber"]', '****1234');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Add an expense linked to the account
      await page.getByRole('link', { name: 'Expenses' }).click();
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('Test Expense');
      await page.getByPlaceholder('Amount (MXN)').fill('100');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Food');
      await page.locator('select').last().selectOption({ label: 'Test Bank' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Check for transaction in account detail
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.click();
      await page.waitForTimeout(1000);

      // Verify transaction appears
      await expect(page.getByText('Test Expense')).toBeVisible();
      await expect(page.locator('text=- $100.00').first()).toBeVisible();
    });

    test('should update account balance when expense transaction is created', async ({ page }) => {
      // Add a bank account with initial balance
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Balance Test Bank');
      await page.fill('input[id="accountNumber"]', '****5678');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Get initial balance
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$1,000.00');

      // Add an expense
      await page.getByRole('link', { name: 'Expenses' }).click();
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('Groceries');
      await page.getByPlaceholder('Amount (MXN)').fill('250');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Food');
      await page.locator('select').last().selectOption({ label: 'Balance Test Bank' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Verify balance was updated (1000 - 250 = 750)
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$750.00');
    });
  });

  test.describe('Transaction Creation from Income', () => {
    test('should create a transaction when income is added with bank account', async ({ page }) => {
      // Add a bank account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Income Test Bank');
      await page.fill('input[id="accountNumber"]', '****9999');
      await page.fill('input[id="balance"]', '500');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Add income linked to the account
      await page.getByRole('link', { name: 'Income' }).click();
      await page.getByRole('button', { name: 'Add Income' }).click();
      await page.getByPlaceholder('Description').fill('Salary Payment');
      await page.getByPlaceholder('Amount (MXN)').fill('5000');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Salary');
      await page.locator('select').last().selectOption({ label: 'Income Test Bank' });
      await page.getByRole('button', { name: /Agregar Ingreso/ }).click();
      await page.waitForTimeout(1000);

      // Check for transaction in account detail
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.click();
      await page.waitForTimeout(1000);

      // Verify transaction appears
      await expect(page.getByText('Salary Payment')).toBeVisible();
      await expect(page.locator('text=$5,000.00').first()).toBeVisible();
    });

    test('should update account balance when income transaction is created', async ({ page }) => {
      // Add a bank account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Income Balance Bank');
      await page.fill('input[id="accountNumber"]', '****1111');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Get initial balance
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$1,000.00');

      // Add income
      await page.getByRole('link', { name: 'Income' }).click();
      await page.getByRole('button', { name: 'Add Income' }).click();
      await page.getByPlaceholder('Description').fill('Freelance Project');
      await page.getByPlaceholder('Amount (MXN)').fill('3000');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Freelance');
      await page.locator('select').last().selectOption({ label: 'Income Balance Bank' });
      await page.getByRole('button', { name: /Agregar Ingreso/ }).click();
      await page.waitForTimeout(1000);

      // Verify balance was updated (1000 + 3000 = 4000)
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$4,000.00');
    });
  });

  test.describe('Transaction List and Filtering', () => {
    test('should display all transactions for an account', async ({ page }) => {
      // Setup: Create account with multiple transactions
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Multi Transaction Bank');
      await page.fill('input[id="accountNumber"]', '****2222');
      await page.fill('input[id="balance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Add expense 1
      await page.getByRole('link', { name: 'Expenses' }).click();
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('Expense 1');
      await page.getByPlaceholder('Amount (MXN)').fill('100');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Food');
      await page.locator('select').last().selectOption({ label: 'Multi Transaction Bank' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Add expense 2
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('Expense 2');
      await page.getByPlaceholder('Amount (MXN)').fill('200');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Transport');
      await page.locator('select').last().selectOption({ label: 'Multi Transaction Bank' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Add income
      await page.getByRole('link', { name: 'Income' }).click();
      await page.getByRole('button', { name: 'Add Income' }).click();
      await page.getByPlaceholder('Description').fill('Income 1');
      await page.getByPlaceholder('Amount (MXN)').fill('1000');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Salary');
      await page.locator('select').last().selectOption({ label: 'Multi Transaction Bank' });
      await page.getByRole('button', { name: /Agregar Ingreso/ }).click();
      await page.waitForTimeout(1000);

      // View account detail
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.click();
      await page.waitForTimeout(1000);

      // Verify all transactions appear
      await expect(page.getByText('Expense 1')).toBeVisible();
      await expect(page.getByText('Expense 2')).toBeVisible();
      await expect(page.getByText('Income 1')).toBeVisible();
    });

    test('should show correct balance calculation after multiple transactions', async ({ page }) => {
      // Create account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Balance Calc Bank');
      await page.fill('input[id="accountNumber"]', '****3333');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      const accountCard = page.locator('[data-testid^="account-card-"]').first();

      // Add expense of 300
      await page.getByRole('link', { name: 'Expenses' }).click();
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('Big Expense');
      await page.getByPlaceholder('Amount (MXN)').fill('300');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Food');
      await page.locator('select').last().selectOption({ label: 'Balance Calc Bank' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Check balance: 1000 - 300 = 700
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$700.00');

      // Add income of 500
      await page.getByRole('link', { name: 'Income' }).click();
      await page.getByRole('button', { name: 'Add Income' }).click();
      await page.getByPlaceholder('Description').fill('Big Income');
      await page.getByPlaceholder('Amount (MXN)').fill('500');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Salary');
      await page.locator('select').last().selectOption({ label: 'Balance Calc Bank' });
      await page.getByRole('button', { name: /Agregar Ingreso/ }).click();
      await page.waitForTimeout(1000);

      // Check final balance: 700 + 500 = 1200
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$1,200.00');
    });
  });

  test.describe('Credit Card Transactions', () => {
    test('should create transaction when expense is charged to credit card', async ({ page }) => {
      // Add a credit card
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Test Credit Card');
      await page.fill('input[id="cardName"]', 'Platinum');
      await page.fill('input[id="lastFourDigits"]', '4444');
      await page.fill('input[id="creditLimit"]', '10000');
      await page.fill('input[id="currentBalance"]', '0');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Add expense to credit card
      await page.getByRole('link', { name: 'Expenses' }).click();
      await page.getByRole('button', { name: 'Add Expense' }).click();
      await page.getByPlaceholder('Description').fill('CC Purchase');
      await page.getByPlaceholder('Amount (MXN)').fill('500');
      await page.locator('input[type="date"]').fill('2025-10-31');
      await page.locator('select').first().selectOption('Shopping');
      await page.locator('select').last().selectOption({ label: 'Test Credit Card - ****4444' });
      await page.getByRole('button', { name: /Agregar Gasto/ }).click();
      await page.waitForTimeout(1000);

      // Verify credit card balance increased
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);
      const creditCard = page.locator('[data-testid^="credit-card-card-"]').first();
      await expect(creditCard).toContainText('$500.00');
    });
  });
});