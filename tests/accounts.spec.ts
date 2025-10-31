import { test, expect } from '@playwright/test';

test.describe('Accounts - Phase 4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Navigate to accounts page
    await page.click('a[href="/accounts"]');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Bank Account Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForSelector('button:has-text("Add Bank Account")');
    });
    test('should display the accounts page with tabs', async ({ page }) => {
      // Check for tabs
      await expect(page.getByRole('button', { name: /Overview/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Bank Accounts/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Credit Cards/i })).toBeVisible();
    });

    test('should add a new bank account', async ({ page }) => {
      // Switch to Bank Accounts tab
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      // Click Add Bank Account
      await page.click('button:has-text("Add Bank Account")');
      await page.waitForTimeout(500);

      // Fill in the form
      await page.fill('input[id="bank"]', 'BBVA');
      await page.selectOption('select[id="accountType"]', 'checking');
      await page.fill('input[id="accountNumber"]', '****1234');
      await page.fill('input[id="balance"]', '5000');
      await page.selectOption('select[id="currency"]', 'MXN');

      // Submit
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Verify account appears in the list
      await expect(page.getByTestId('account-list')).toContainText('BBVA');
      await expect(page.getByTestId('account-list')).toContainText('$5,000.00');
    });

    test('should edit an existing bank account', async ({ page }) => {
      // First add an account
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[id="bank"]', 'Santander');
      await page.fill('input[id="accountNumber"]', '****5678');
      await page.fill('input[id="balance"]', '3000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Click Edit on the account
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.locator('[data-testid^="edit-account-"]').click();
      await page.waitForTimeout(500);

      // Update the balance
      await page.fill('input[id="balance"]', '3500');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Verify the update
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$3,500.00');
    });

    test('should delete a bank account', async ({ page }) => {
      // First add an account
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[id="bank"]', 'Test Bank');
      await page.fill('input[id="accountNumber"]', '****9999');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Delete the account
      page.on('dialog', dialog => dialog.accept());
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.locator('[data-testid^="delete-account-"]').click();
      await page.waitForTimeout(1000);

      // Verify it's gone
      await expect(page.getByText('No bank accounts added yet.')).toBeVisible();
    });

    test('should quick update account balance', async ({ page }) => {
      // First add an account
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[id="bank"]', 'Quick Update Test');
      await page.fill('input[id="accountNumber"]', '****1111');
      await page.fill('input[id="balance"]', '2000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Click the Update button next to balance
      const accountCard = page.locator('[data-testid^="account-card-"]').first();
      await accountCard.locator('button:has-text("Update")').click();
      await page.waitForTimeout(500);

      // Update the balance
      await page.fill('input[type="number"]', '2500');
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(1000);

      // Verify the update
      await expect(accountCard.locator('[data-testid^="account-balance-"]')).toContainText('$2,500.00');
    });
  });

  test.describe('Credit Card Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Credit Cards")');
      await page.waitForSelector('button:has-text("Add Credit Card")');
    });
    test('should add a new credit card', async ({ page }) => {
      // Switch to Credit Cards tab
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);

      // Click Add Credit Card
      await page.click('button:has-text("Add Credit Card")');
      await page.waitForTimeout(500);

      // Fill in the form
      await page.fill('input[id="bank"]', 'BBVA');
      await page.fill('input[id="cardName"]', 'Platinum');
      await page.fill('input[id="lastFourDigits"]', '4321');
      await page.fill('input[id="creditLimit"]', '50000');
      await page.fill('input[id="currentBalance"]', '10000');
      await page.fill('input[id="cutoffDate"]', '15');
      await page.fill('input[id="paymentDate"]', '20');
      await page.fill('input[id="interestRate"]', '24.99');

      // Submit
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Verify card appears in the list
      await expect(page.getByTestId('credit-card-list')).toContainText('BBVA');
      await expect(page.getByTestId('credit-card-list')).toContainText('Platinum');
      await expect(page.getByTestId('credit-card-list')).toContainText('4321');
    });

    test('should display credit utilization', async ({ page }) => {
      // Switch to Credit Cards tab
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);

      // Add a card with 50% utilization
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Utilization Test');
      await page.fill('input[id="cardName"]', 'Test Card');
      await page.fill('input[id="lastFourDigits"]', '1234');
      await page.fill('input[id="creditLimit"]', '10000');
      await page.fill('input[id="currentBalance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Verify utilization is displayed
      const card = page.locator('[data-testid^="credit-card-card-"]').first();
      await expect(card.locator('[data-testid^="credit-card-utilization-"]')).toContainText('50.0%');
    });

    test('should edit a credit card', async ({ page }) => {
      // Switch to Credit Cards tab
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);

      // Add a card
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Edit Test Bank');
      await page.fill('input[id="cardName"]', 'Gold');
      await page.fill('input[id="lastFourDigits"]', '5678');
      await page.fill('input[id="creditLimit"]', '30000');
      await page.fill('input[id="currentBalance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Edit the card
      const cardElement = page.locator('[data-testid^="credit-card-card-"]').first();
      await cardElement.locator('[data-testid^="edit-credit-card-"]').click();
      await page.waitForTimeout(500);

      // Update balance
      await page.fill('input[id="currentBalance"]', '8000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Verify the update (utilization should change)
      await expect(cardElement.locator('[data-testid^="credit-card-utilization-"]')).toContainText('26.7%');
    });

    test('should delete a credit card', async ({ page }) => {
      // Switch to Credit Cards tab
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);

      // Add a card
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Delete Test');
      await page.fill('input[id="cardName"]', 'Test');
      await page.fill('input[id="lastFourDigits"]', '9999');
      await page.fill('input[id="creditLimit"]', '20000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Delete the card
      page.on('dialog', dialog => dialog.accept());
      const cardElement = page.locator('[data-testid^="credit-card-card-"]').first();
      await cardElement.locator('[data-testid^="delete-credit-card-"]').click();
      await page.waitForTimeout(1000);

      // Verify it's gone
      await expect(page.getByText('No credit cards added yet.')).toBeVisible();
    });
  });

  test.describe('Account Overview', () => {
    test('should display account overview with summary cards', async ({ page }) => {
      // Should be on Overview tab by default
      await expect(page.getByTestId('net-worth-card')).toBeVisible();
      await expect(page.getByTestId('total-bank-balance-card')).toBeVisible();
      await expect(page.getByTestId('credit-card-debt-card')).toBeVisible();
      await expect(page.getByTestId('credit-utilization-card')).toBeVisible();
    });

    test('should show correct totals after adding accounts and cards', async ({ page }) => {
      // Add a bank account
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[id="bank"]', 'Overview Test Bank');
      await page.fill('input[id="accountNumber"]', '****1234');
      await page.fill('input[id="balance"]', '10000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Add a credit card
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Overview Test CC');
      await page.fill('input[id="cardName"]', 'Test');
      await page.fill('input[id="lastFourDigits"]', '5678');
      await page.fill('input[id="creditLimit"]', '20000');
      await page.fill('input[id="currentBalance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Go to Overview
      await page.click('button:has-text("Overview")');
      await page.waitForTimeout(1000);

      // Check totals (Net Worth should be 10000 - 5000 = 5000)
      await expect(page.getByTestId('total-bank-balance-card')).toContainText('$10,000.00');
      await expect(page.getByTestId('credit-card-debt-card')).toContainText('$5,000.00');
      await expect(page.getByTestId('net-worth-card')).toContainText('$5,000.00');
    });
  });
});
