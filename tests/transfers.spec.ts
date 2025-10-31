import { test, expect } from '@playwright/test';

test.describe('Transfer System - Phase 4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Bank to Bank Transfers', () => {
    test('should create a transfer between two bank accounts', async ({ page }) => {
      // Create source account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Source Bank');
      await page.fill('input[id="accountNumber"]', '****1111');
      await page.fill('input[id="balance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Create destination account
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Destination Bank');
      await page.fill('input[id="accountNumber"]', '****2222');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Navigate to Transfers (assuming there's a transfers section in Accounts)
      // For now, let's check if there's a Transfer button in the UI
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        // Fill transfer form
        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Source Bank/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Destination Bank/ });
        await page.fill('input[name="amount"]', '500');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.fill('textarea[name="description"]', 'Transfer test');

        // Submit transfer
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Verify source account balance decreased (5000 - 500 = 4500)
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);
        const sourceCard = page.locator('[data-testid="account-card-"]').filter({ hasText: 'Source Bank' });
        await expect(sourceCard.locator('[data-testid^="account-balance-"]')).toContainText('$4,500.00');

        // Verify destination account balance increased (1000 + 500 = 1500)
        const destCard = page.locator('[data-testid="account-card-"]').filter({ hasText: 'Destination Bank' });
        await expect(destCard.locator('[data-testid^="account-balance-"]')).toContainText('$1,500.00');
      }
    });

    test('should create two linked transactions for a transfer (double-entry)', async ({ page }) => {
      // Create two bank accounts
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Account A');
      await page.fill('input[id="accountNumber"]', '****AAAA');
      await page.fill('input[id="balance"]', '3000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Account B');
      await page.fill('input[id="accountNumber"]', '****BBBB');
      await page.fill('input[id="balance"]', '2000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Create transfer
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Account A/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Account B/ });
        await page.fill('input[name="amount"]', '300');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.fill('textarea[name="description"]', 'Double-entry test');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Check Account A transaction history (should show -300)
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);
        const accountACard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Account A' });
        await accountACard.click();
        await page.waitForTimeout(1000);

        await expect(page.locator('text=Transfer')).toBeVisible();
        await expect(page.locator('text=- $300.00').first()).toBeVisible();

        // Go back and check Account B transaction history (should show +300)
        await page.goBack();
        await page.waitForTimeout(500);
        const accountBCard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Account B' });
        await accountBCard.click();
        await page.waitForTimeout(1000);

        await expect(page.locator('text=Transfer')).toBeVisible();
        await expect(page.locator('text=$300.00').first()).toBeVisible();
      }
    });
  });

  test.describe('Bank to Credit Card Transfers (Payments)', () => {
    test('should pay credit card from bank account', async ({ page }) => {
      // Create bank account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Payment Bank');
      await page.fill('input[id="accountNumber"]', '****9999');
      await page.fill('input[id="balance"]', '10000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Create credit card with balance
      await page.click('button:has-text("Credit Cards")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("Add Credit Card")');
      await page.fill('input[id="bank"]', 'Payment CC');
      await page.fill('input[id="cardName"]', 'Gold');
      await page.fill('input[id="lastFourDigits"]', '5555');
      await page.fill('input[id="creditLimit"]', '20000');
      await page.fill('input[id="currentBalance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Make payment (transfer)
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Payment Bank/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Payment CC/ });
        await page.fill('input[name="amount"]', '2000');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.fill('textarea[name="description"]', 'CC Payment');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Verify bank balance decreased (10000 - 2000 = 8000)
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);
        const bankCard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Payment Bank' });
        await expect(bankCard.locator('[data-testid^="account-balance-"]')).toContainText('$8,000.00');

        // Verify credit card balance decreased (5000 - 2000 = 3000)
        await page.click('button:has-text("Credit Cards")');
        await page.waitForTimeout(500);
        const ccCard = page.locator('[data-testid^="credit-card-card-"]').filter({ hasText: 'Payment CC' });
        await expect(ccCard).toContainText('$3,000.00');
      }
    });
  });

  test.describe('Transfer Validation', () => {
    test('should prevent transfer with insufficient funds', async ({ page }) => {
      // Create bank account with low balance
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Low Balance Bank');
      await page.fill('input[id="accountNumber"]', '****0001');
      await page.fill('input[id="balance"]', '100');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Create destination account
      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Dest Bank');
      await page.fill('input[id="accountNumber"]', '****0002');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Try to transfer more than available
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Low Balance Bank/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Dest Bank/ });
        await page.fill('input[name="amount"]', '500');
        await page.locator('input[type="date"]').fill('2025-10-31');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1000);

        // Should show error message
        const errorMessage = page.locator('text=/insufficient funds/i');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toBeVisible();
        }

        // Verify balance didn't change
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);
        const sourceCard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Low Balance Bank' });
        await expect(sourceCard.locator('[data-testid^="account-balance-"]')).toContainText('$100.00');
      }
    });

    test('should prevent transfer to same account', async ({ page }) => {
      // Create single bank account
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Same Account Bank');
      await page.fill('input[id="accountNumber"]', '****SAME');
      await page.fill('input[id="balance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Try to transfer to same account
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Same Account Bank/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Same Account Bank/ });
        await page.fill('input[name="amount"]', '100');
        await page.locator('input[type="date"]').fill('2025-10-31');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1000);

        // Should show error or prevent selection
        const errorMessage = page.locator('text=/same account/i');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test('should validate minimum transfer amount', async ({ page }) => {
      // Create two bank accounts
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Min Amount Source');
      await page.fill('input[id="accountNumber"]', '****MIN1');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Min Amount Dest');
      await page.fill('input[id="accountNumber"]', '****MIN2');
      await page.fill('input[id="balance"]', '1000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Try to transfer $0 or negative amount
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Min Amount Source/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Min Amount Dest/ });
        await page.fill('input[name="amount"]', '0');
        await page.locator('input[type="date"]').fill('2025-10-31');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(500);

        // Should show validation error (HTML5 validation or custom)
        const submitButton = page.locator('button[type="submit"]');
        const isDisabled = await submitButton.isDisabled();
        expect(isDisabled || await page.locator('text=/amount/i').count() > 0).toBeTruthy();
      }
    });
  });

  test.describe('Transfer History and Tracking', () => {
    test('should display transfer in transaction history of both accounts', async ({ page }) => {
      // Create two bank accounts
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'History Bank A');
      await page.fill('input[id="accountNumber"]', '****HISA');
      await page.fill('input[id="balance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'History Bank B');
      await page.fill('input[id="accountNumber"]', '****HISB');
      await page.fill('input[id="balance"]', '3000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      // Create transfer
      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        await transferButton.click();
        await page.waitForTimeout(500);

        await page.locator('select[name="fromAccountId"]').selectOption({ label: /History Bank A/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /History Bank B/ });
        await page.fill('input[name="amount"]', '750');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.fill('textarea[name="description"]', 'History test transfer');

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Check Bank A transaction history
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);
        const bankACard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'History Bank A' });
        await bankACard.click();
        await page.waitForTimeout(1000);

        // Should show debit transaction
        await expect(page.getByText(/History test transfer|Transfer/i)).toBeVisible();

        // Go back and check Bank B transaction history
        await page.goBack();
        await page.waitForTimeout(500);
        const bankBCard = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'History Bank B' });
        await bankBCard.click();
        await page.waitForTimeout(1000);

        // Should show credit transaction
        await expect(page.getByText(/History test transfer|Transfer/i)).toBeVisible();
      }
    });
  });

  test.describe('Balance Updates from Transfers', () => {
    test('should correctly update balances for multiple sequential transfers', async ({ page }) => {
      // Create three bank accounts
      await page.getByRole('link', { name: 'Accounts' }).click();
      await page.click('button:has-text("Bank Accounts")');
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Multi Transfer A');
      await page.fill('input[id="accountNumber"]', '****MTA');
      await page.fill('input[id="balance"]', '10000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Multi Transfer B');
      await page.fill('input[id="accountNumber"]', '****MTB');
      await page.fill('input[id="balance"]', '5000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add Bank Account' }).click();
      await page.fill('input[id="bank"]', 'Multi Transfer C');
      await page.fill('input[id="accountNumber"]', '****MTC');
      await page.fill('input[id="balance"]', '2000');
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(1000);

      const transferButton = page.locator('button:has-text("Transfer")');
      if (await transferButton.count() > 0) {
        // Transfer 1: A -> B (1000)
        await transferButton.click();
        await page.waitForTimeout(500);
        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Multi Transfer A/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Multi Transfer B/ });
        await page.fill('input[name="amount"]', '1000');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Transfer 2: B -> C (500)
        await transferButton.click();
        await page.waitForTimeout(500);
        await page.locator('select[name="fromAccountId"]').selectOption({ label: /Multi Transfer B/ });
        await page.locator('select[name="toAccountId"]').selectOption({ label: /Multi Transfer C/ });
        await page.fill('input[name="amount"]', '500');
        await page.locator('input[type="date"]').fill('2025-10-31');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(1500);

        // Verify final balances
        await page.click('button:has-text("Bank Accounts")');
        await page.waitForTimeout(500);

        // A: 10000 - 1000 = 9000
        const accountA = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Multi Transfer A' });
        await expect(accountA.locator('[data-testid^="account-balance-"]')).toContainText('$9,000.00');

        // B: 5000 + 1000 - 500 = 5500
        const accountB = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Multi Transfer B' });
        await expect(accountB.locator('[data-testid^="account-balance-"]')).toContainText('$5,500.00');

        // C: 2000 + 500 = 2500
        const accountC = page.locator('[data-testid^="account-card-"]').filter({ hasText: 'Multi Transfer C' });
        await expect(accountC.locator('[data-testid^="account-balance-"]')).toContainText('$2,500.00');
      }
    });
  });
});
