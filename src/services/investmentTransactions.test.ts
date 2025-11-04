/**
 * Tests for Investment Transaction Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../data/db';
import {
  createInvestmentWithAccountDeduction,
  addContributionWithAccountDeduction,
  processWithdrawalToAccount,
  getTotalInvested
} from './investmentTransactions';
import { Account } from '../types';

describe('Investment Transaction Service', () => {
  // Clean up database before and after each test
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('createInvestmentWithAccountDeduction', () => {
    it('should create investment and deduct from account', async () => {
      // Create a test account
      const account: Account = {
        id: 'test-account-1',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'savings',
        accountNumber: '1234',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      // Create investment
      const result = await createInvestmentWithAccountDeduction(
        {
          platform: 'Nu',
          type: 'Cajita',
          initialCapital: 5000,
          startDate: new Date(),
          gatPercentage: 15,
          dailyReturn: 0,
          autoReinvest: true
        },
        'test-account-1'
      );

      expect(result.success).toBe(true);
      expect(result.investment).toBeDefined();
      expect(result.transaction).toBeDefined();

      // Check account balance was deducted
      const updatedAccount = await db.accounts.get('test-account-1');
      expect(updatedAccount?.balance).toBe(5000);

      // Check transaction was created
      const transactions = await db.transactions.toArray();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(-5000);
      expect(transactions[0].type).toBe('withdrawal');
    });

    it('should fail with insufficient funds', async () => {
      const account: Account = {
        id: 'test-account-2',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'savings',
        accountNumber: '5678',
        balance: 1000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      const result = await createInvestmentWithAccountDeduction(
        {
          platform: 'Nu',
          type: 'Cajita',
          initialCapital: 5000,
          startDate: new Date(),
          gatPercentage: 15,
          dailyReturn: 0,
          autoReinvest: true
        },
        'test-account-2'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient funds');
    });

    it('should create investment without account (backward compatibility)', async () => {
      const result = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      expect(result.success).toBe(true);
      expect(result.investment).toBeDefined();
      expect(result.transaction).toBeUndefined();
      expect(result.investment?.sourceAccountId).toBeUndefined();
    });

    it('should fail with non-existent account', async () => {
      const result = await createInvestmentWithAccountDeduction(
        {
          platform: 'Nu',
          type: 'Cajita',
          initialCapital: 5000,
          startDate: new Date(),
          gatPercentage: 15,
          dailyReturn: 0,
          autoReinvest: true
        },
        'non-existent-account'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
    });

    it('should fail with inactive account', async () => {
      const account: Account = {
        id: 'inactive-account',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'savings',
        accountNumber: '9999',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      const result = await createInvestmentWithAccountDeduction(
        {
          platform: 'Nu',
          type: 'Cajita',
          initialCapital: 5000,
          startDate: new Date(),
          gatPercentage: 15,
          dailyReturn: 0,
          autoReinvest: true
        },
        'inactive-account'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account is inactive');
    });
  });

  describe('addContributionWithAccountDeduction', () => {
    it('should add contribution and deduct from account', async () => {
      // Setup account and investment
      const account: Account = {
        id: 'test-account-3',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'savings',
        accountNumber: '1111',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      const investmentResult = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      const investmentId = investmentResult.investment!.id;

      // Add contribution
      const result = await addContributionWithAccountDeduction(
        investmentId,
        2000,
        'test-account-3',
        'Monthly contribution'
      );

      expect(result.success).toBe(true);
      expect(result.contribution).toBeDefined();

      // Check account balance
      const updatedAccount = await db.accounts.get('test-account-3');
      expect(updatedAccount?.balance).toBe(8000);

      // Check investment value
      const investment = await db.investments.get(investmentId);
      expect(investment?.currentValue).toBe(7000); // 5000 + 2000
    });

    it('should fail contribution with insufficient funds', async () => {
      const account: Account = {
        id: 'test-account-4',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'savings',
        accountNumber: '2222',
        balance: 500,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      const investmentResult = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 1000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      const result = await addContributionWithAccountDeduction(
        investmentResult.investment!.id,
        2000,
        'test-account-4'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient funds');
    });
  });

  describe('processWithdrawalToAccount', () => {
    it('should process withdrawal and add to account', async () => {
      // Setup investment
      const investmentResult = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      const investmentId = investmentResult.investment!.id;

      // Create destination account
      const account: Account = {
        id: 'dest-account',
        name: 'Test Bank',
        type: 'bank',
        bankName: 'Test Bank',
        accountType: 'checking',
        accountNumber: '3333',
        balance: 1000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.accounts.add(account);

      // Process withdrawal
      const result = await processWithdrawalToAccount(
        investmentId,
        2000,
        'dest-account',
        'Emergency withdrawal'
      );

      expect(result.success).toBe(true);
      expect(result.withdrawal).toBeDefined();

      // Check account balance increased
      const updatedAccount = await db.accounts.get('dest-account');
      expect(updatedAccount?.balance).toBe(3000); // 1000 + 2000

      // Check investment value decreased
      const investment = await db.investments.get(investmentId);
      expect(investment?.currentValue).toBe(3000); // 5000 - 2000
    });

    it('should fail withdrawal exceeding investment value', async () => {
      const investmentResult = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 1000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      const result = await processWithdrawalToAccount(
        investmentResult.investment!.id,
        2000
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient funds in investment');
    });
  });

  describe('getTotalInvested', () => {
    it('should calculate total invested correctly', async () => {
      // Create investment
      const investmentResult = await createInvestmentWithAccountDeduction({
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        autoReinvest: true
      });

      const investmentId = investmentResult.investment!.id;

      // Add contributions
      await addContributionWithAccountDeduction(investmentId, 1000);
      await addContributionWithAccountDeduction(investmentId, 500);

      // Add withdrawal
      await processWithdrawalToAccount(investmentId, 500);

      // Calculate total invested
      const total = await getTotalInvested(investmentId);

      expect(total).toBe(6000); // 5000 + 1000 + 500 - 500
    });
  });
});