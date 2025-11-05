/**
 * Investment Transaction Service
 *
 * Handles the business logic for moving money between bank accounts and investments.
 * Ensures proper double-entry bookkeeping and transaction creation.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import {
  Investment,
  InvestmentContribution,
  InvestmentWithdrawal,
  BankAccount,
  Transaction
} from '../types';

interface CreateInvestmentResult {
  success: boolean;
  investment?: Investment;
  transaction?: Transaction;
  error?: string;
}

interface AddContributionResult {
  success: boolean;
  contribution?: InvestmentContribution;
  transaction?: Transaction;
  error?: string;
}

interface ProcessWithdrawalResult {
  success: boolean;
  withdrawal?: InvestmentWithdrawal;
  transaction?: Transaction;
  error?: string;
}

/**
 * Validates that an account exists, is active, and has sufficient funds
 */
async function validateAccountForDeduction(
  accountId: string,
  amount: number
): Promise<{ valid: boolean; error?: string; account?: BankAccount }> {
  const account = await db.accounts.get(accountId);

  if (!account) {
    return { valid: false, error: 'Account not found' };
  }

  if (!account.isActive) {
    return { valid: false, error: 'Account is inactive' };
  }

  if (account.balance < amount) {
    return {
      valid: false,
      error: `Insufficient funds. Available: $${account.balance.toFixed(2)}, Required: $${amount.toFixed(2)}`
    };
  }

  return { valid: true, account };
}

/**
 * Validates that an account exists and is active (for deposits)
 */
async function validateAccountForDeposit(
  accountId: string
): Promise<{ valid: boolean; error?: string; account?: BankAccount }> {
  const account = await db.accounts.get(accountId);

  if (!account) {
    return { valid: false, error: 'Account not found' };
  }

  if (!account.isActive) {
    return { valid: false, error: 'Account is inactive' };
  }

  return { valid: true, account };
}

/**
 * Creates a transaction record for an investment-related money movement
 */
async function createInvestmentTransaction(
  accountId: string,
  amount: number,
  type: 'withdrawal' | 'deposit',
  description: string,
  newBalance: number
): Promise<Transaction> {
  const transaction: Transaction = {
    id: uuidv4(),
    accountId,
    accountType: 'bank',
    date: new Date(),
    amount: type === 'withdrawal' ? -amount : amount,
    type,
    description,
    balance: newBalance,
    pending: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.transactions.add(transaction);
  return transaction;
}

/**
 * Create a new investment and deduct money from the source account
 */
export async function createInvestmentWithAccountDeduction(
  investmentData: Omit<Investment, 'id' | 'accumulatedReturns' | 'currentValue' | 'lastUpdate' | 'contributions' | 'withdrawals'>,
  sourceAccountId?: string
): Promise<CreateInvestmentResult> {
  try {
    // If sourceAccountId provided, validate and deduct
    if (sourceAccountId) {
      const validation = await validateAccountForDeduction(
        sourceAccountId,
        investmentData.initialCapital
      );

      if (!validation.valid || !validation.account) {
        return { success: false, error: validation.error };
      }

      // Create the investment
      const investment: Investment = {
        id: uuidv4(),
        ...investmentData,
        accumulatedReturns: 0,
        currentValue: investmentData.initialCapital,
        lastUpdate: new Date(),
        sourceAccountId,
        contributions: [],
        withdrawals: []
      };

      // Update account balance
      const newBalance = validation.account.balance - investmentData.initialCapital;
      await db.accounts.update(sourceAccountId, {
        balance: newBalance,
        lastUpdate: new Date()
      });

      // Create transaction record
      const transaction = await createInvestmentTransaction(
        sourceAccountId,
        investmentData.initialCapital,
        'withdrawal',
        `Investment in ${investmentData.platform} - ${investmentData.type}`,
        newBalance
      );

      // Save investment to database
      await db.investments.add(investment);

      return { success: true, investment, transaction };
    } else {
      // No source account - create investment without deduction (backward compatibility)
      const investment: Investment = {
        id: uuidv4(),
        ...investmentData,
        accumulatedReturns: 0,
        currentValue: investmentData.initialCapital,
        lastUpdate: new Date(),
        contributions: [],
        withdrawals: []
      };

      await db.investments.add(investment);
      return { success: true, investment };
    }
  } catch (error) {
    console.error('Error creating investment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Add a contribution to an existing investment and deduct from account
 */
export async function addContributionWithAccountDeduction(
  investmentId: string,
  amount: number,
  sourceAccountId?: string,
  source?: string
): Promise<AddContributionResult> {
  try {
    // Get the investment
    const investment = await db.investments.get(investmentId);
    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    let transaction: Transaction | undefined;

    // If sourceAccountId provided, validate and deduct
    if (sourceAccountId) {
      const validation = await validateAccountForDeduction(sourceAccountId, amount);

      if (!validation.valid || !validation.account) {
        return { success: false, error: validation.error };
      }

      // Update account balance
      const newBalance = validation.account.balance - amount;
      await db.accounts.update(sourceAccountId, {
        balance: newBalance,
        lastUpdate: new Date()
      });

      // Create transaction record
      transaction = await createInvestmentTransaction(
        sourceAccountId,
        amount,
        'withdrawal',
        `Contribution to ${investment.platform} - ${investment.type}`,
        newBalance      );
    }

    // Create contribution record
    const contribution: InvestmentContribution = {
      id: uuidv4(),
      investmentId,
      date: new Date(),
      amount,
      source,
      sourceAccountId,
      createdAt: new Date()
    };

    await db.investmentContributions.add(contribution);

    // Update investment current value
    const newCurrentValue = investment.currentValue + amount;
    await db.investments.update(investmentId, {
      currentValue: newCurrentValue,
      lastUpdate: new Date()
    });

    return { success: true, contribution, transaction };
  } catch (error) {
    console.error('Error adding contribution:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Process a withdrawal from an investment and add to destination account
 */
export async function processWithdrawalToAccount(
  investmentId: string,
  amount: number,
  destinationAccountId?: string,
  reason?: string
): Promise<ProcessWithdrawalResult> {
  try {
    // Get the investment
    const investment = await db.investments.get(investmentId);
    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    // Validate withdrawal amount
    if (amount > investment.currentValue) {
      return {
        success: false,
        error: `Insufficient funds in investment. Available: $${investment.currentValue.toFixed(2)}, Requested: $${amount.toFixed(2)}`
      };
    }

    let transaction: Transaction | undefined;

    // If destinationAccountId provided, validate and deposit
    if (destinationAccountId) {
      const validation = await validateAccountForDeposit(destinationAccountId);

      if (!validation.valid || !validation.account) {
        return { success: false, error: validation.error };
      }

      // Update account balance
      const newBalance = validation.account.balance + amount;
      await db.accounts.update(destinationAccountId, {
        balance: newBalance,
        lastUpdate: new Date()
      });

      // Create transaction record
      transaction = await createInvestmentTransaction(
        destinationAccountId,
        amount,
        'deposit',
        `Withdrawal from ${investment.platform} - ${investment.type}`,
        newBalance
      );
    }

    // Create withdrawal record
    const withdrawal: InvestmentWithdrawal = {
      id: uuidv4(),
      investmentId,
      date: new Date(),
      amount,
      reason,
      destinationAccountId,
      createdAt: new Date()
    };

    await db.investmentWithdrawals.add(withdrawal);

    // Update investment current value
    const newCurrentValue = investment.currentValue - amount;
    await db.investments.update(investmentId, {
      currentValue: newCurrentValue,
      lastUpdate: new Date()
    });

    return { success: true, withdrawal, transaction };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all contributions for an investment
 */
export async function getInvestmentContributions(
  investmentId: string
): Promise<InvestmentContribution[]> {
  return await db.investmentContributions
    .where('investmentId')
    .equals(investmentId)
    .filter(c => c.deletedAt == null)
    .sortBy('date');
}

/**
 * Get all withdrawals for an investment
 */
export async function getInvestmentWithdrawals(
  investmentId: string
): Promise<InvestmentWithdrawal[]> {
  return await db.investmentWithdrawals
    .where('investmentId')
    .equals(investmentId)
    .filter(w => w.deletedAt == null)
    .sortBy('date');
}

/**
 * Get total contributions for an investment
 */
export async function getTotalContributions(investmentId: string): Promise<number> {
  const contributions = await getInvestmentContributions(investmentId);
  return contributions.reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Get total withdrawals for an investment
 */
export async function getTotalWithdrawals(investmentId: string): Promise<number> {
  const withdrawals = await getInvestmentWithdrawals(investmentId);
  return withdrawals.reduce((sum, w) => sum + w.amount, 0);
}

/**
 * Calculate total invested amount (initial + contributions - withdrawals)
 */
export async function getTotalInvested(investmentId: string): Promise<number> {
  const investment = await db.investments.get(investmentId);
  if (!investment || investment.deletedAt) return 0;

  const totalContributions = await getTotalContributions(investmentId);
  const totalWithdrawals = await getTotalWithdrawals(investmentId);

  return investment.initialCapital + totalContributions - totalWithdrawals;
}
