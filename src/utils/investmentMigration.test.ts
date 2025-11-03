/**
 * Tests for Investment Migration Utility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../data/db';
import {
  hasUnlinkedInvestments,
  getUnlinkedInvestments,
  getUnlinkedInvestmentsCount,
  linkInvestmentToAccount,
  getMigrationStatus,
  shouldShowMigrationPrompt,
  bulkLinkInvestments
} from './investmentMigration';
import { Investment, BankAccount } from '../types';

describe('Investment Migration Utility', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('hasUnlinkedInvestments', () => {
    it('should return false when no investments exist', async () => {
      const result = await hasUnlinkedInvestments();
      expect(result).toBe(false);
    });

    it('should return false when all investments have accounts', async () => {
      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true,
        sourceAccountId: 'account-1'
      };
      await db.investments.add(investment);

      const result = await hasUnlinkedInvestments();
      expect(result).toBe(false);
    });

    it('should return true when investments without accounts exist', async () => {
      const investment: Investment = {
        id: 'inv-2',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
        // No sourceAccountId
      };
      await db.investments.add(investment);

      const result = await hasUnlinkedInvestments();
      expect(result).toBe(true);
    });
  });

  describe('getUnlinkedInvestments', () => {
    it('should return only investments without accounts', async () => {
      const linkedInvestment: Investment = {
        id: 'linked-inv',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true,
        sourceAccountId: 'account-1'
      };

      const unlinkedInvestment: Investment = {
        id: 'unlinked-inv',
        platform: 'Didi',
        type: 'Ahorro',
        initialCapital: 3000,
        startDate: new Date(),
        gatPercentage: 12,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 3000,
        lastUpdate: new Date(),
        autoReinvest: false
        // No sourceAccountId
      };

      await db.investments.add(linkedInvestment);
      await db.investments.add(unlinkedInvestment);

      const result = await getUnlinkedInvestments();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('unlinked-inv');
    });
  });

  describe('getUnlinkedInvestmentsCount', () => {
    it('should return correct count', async () => {
      const inv1: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      const inv2: Investment = {
        id: 'inv-2',
        platform: 'Didi',
        type: 'Ahorro',
        initialCapital: 3000,
        startDate: new Date(),
        gatPercentage: 12,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 3000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.investments.add(inv1);
      await db.investments.add(inv2);

      const count = await getUnlinkedInvestmentsCount();
      expect(count).toBe(2);
    });
  });

  describe('linkInvestmentToAccount', () => {
    it('should successfully link investment to account', async () => {
      const account: BankAccount = {
        id: 'account-1',
        bank: 'Test Bank',
        accountType: 'savings',
        accountNumber: '1234',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true
      };

      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.accounts.add(account);
      await db.investments.add(investment);

      const result = await linkInvestmentToAccount('inv-1', 'account-1');

      expect(result.success).toBe(true);

      const updatedInvestment = await db.investments.get('inv-1');
      expect(updatedInvestment?.sourceAccountId).toBe('account-1');
    });

    it('should fail with non-existent investment', async () => {
      const result = await linkInvestmentToAccount('non-existent', 'account-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Investment not found');
    });

    it('should fail with non-existent account', async () => {
      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.investments.add(investment);

      const result = await linkInvestmentToAccount('inv-1', 'non-existent-account');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
    });
  });

  describe('getMigrationStatus', () => {
    it('should return correct status', async () => {
      const linkedInv: Investment = {
        id: 'linked',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true,
        sourceAccountId: 'account-1'
      };

      const unlinked1: Investment = {
        id: 'unlinked-1',
        platform: 'Didi',
        type: 'Ahorro',
        initialCapital: 3000,
        startDate: new Date(),
        gatPercentage: 12,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 3000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      const unlinked2: Investment = {
        id: 'unlinked-2',
        platform: 'MercadoPago',
        type: 'Fondo',
        initialCapital: 2000,
        startDate: new Date(),
        gatPercentage: 10,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 2000,
        lastUpdate: new Date(),
        autoReinvest: false
      };

      await db.investments.add(linkedInv);
      await db.investments.add(unlinked1);
      await db.investments.add(unlinked2);

      const status = await getMigrationStatus();

      expect(status.total).toBe(3);
      expect(status.linked).toBe(1);
      expect(status.unlinked).toBe(2);
      expect(status.needsMigration).toBe(true);
    });

    it('should indicate no migration needed when all linked', async () => {
      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true,
        sourceAccountId: 'account-1'
      };

      await db.investments.add(investment);

      const status = await getMigrationStatus();

      expect(status.needsMigration).toBe(false);
    });
  });

  describe('shouldShowMigrationPrompt', () => {
    it('should return true when investments exist and need migration', async () => {
      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.investments.add(investment);

      const result = await shouldShowMigrationPrompt();
      expect(result).toBe(true);
    });

    it('should return false when no investments exist', async () => {
      const result = await shouldShowMigrationPrompt();
      expect(result).toBe(false);
    });

    it('should return false when all investments are linked', async () => {
      const investment: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true,
        sourceAccountId: 'account-1'
      };

      await db.investments.add(investment);

      const result = await shouldShowMigrationPrompt();
      expect(result).toBe(false);
    });
  });

  describe('bulkLinkInvestments', () => {
    it('should link multiple investments successfully', async () => {
      const account: BankAccount = {
        id: 'account-1',
        bank: 'Test Bank',
        accountType: 'savings',
        accountNumber: '1234',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true
      };

      const inv1: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      const inv2: Investment = {
        id: 'inv-2',
        platform: 'Didi',
        type: 'Ahorro',
        initialCapital: 3000,
        startDate: new Date(),
        gatPercentage: 12,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 3000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.accounts.add(account);
      await db.investments.add(inv1);
      await db.investments.add(inv2);

      const result = await bulkLinkInvestments([
        { investmentId: 'inv-1', sourceAccountId: 'account-1' },
        { investmentId: 'inv-2', sourceAccountId: 'account-1' }
      ]);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial failures', async () => {
      const account: BankAccount = {
        id: 'account-1',
        bank: 'Test Bank',
        accountType: 'savings',
        accountNumber: '1234',
        balance: 10000,
        currency: 'MXN',
        lastUpdate: new Date(),
        isActive: true
      };

      const inv1: Investment = {
        id: 'inv-1',
        platform: 'Nu',
        type: 'Cajita',
        initialCapital: 5000,
        startDate: new Date(),
        gatPercentage: 15,
        dailyReturn: 0,
        accumulatedReturns: 0,
        currentValue: 5000,
        lastUpdate: new Date(),
        autoReinvest: true
      };

      await db.accounts.add(account);
      await db.investments.add(inv1);

      const result = await bulkLinkInvestments([
        { investmentId: 'inv-1', sourceAccountId: 'account-1' },
        { investmentId: 'non-existent', sourceAccountId: 'account-1' }
      ]);

      expect(result.success).toBe(false);
      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
