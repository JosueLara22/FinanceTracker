/**
 * Robust Income Operations
 *
 * Implements the transaction lifecycle management for incomes
 * following the patterns from robustTransactions.md
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import { dbReady } from '../data/db';
import { Income, Transaction } from '../types';
import {
  recalculateRunningBalances,
  updateAccountBalanceForTransaction,
} from './transactionUtils';

// ============================================================================
// CREATE INCOME
// ============================================================================

export async function createIncome(incomeData: Omit<Income, 'id'>): Promise<Income> {
  await dbReady;
  const income: Income = {
    ...incomeData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.transaction('rw', db.incomes, db.transactions, db.accounts, db.creditCards, async () => {
      await db.incomes.add(income);

      if (income.accountId) {
        await createTransactionFromIncome(income);
      }
    });

    return income;
  } catch (error) {
    console.error('Failed to create income:', error);
    console.error('Error string representation:', String(error));
    if (typeof error === 'object' && error !== null && 'message' in error) {
      console.error('Error message property:', (error as any).message);
    }
    throw new Error('Failed to create income. Please try again.');
  }
}

async function createTransactionFromIncome(income: Income): Promise<void> {
  await dbReady;
  if (!income.accountId) return;

  const account = await db.accounts.get(income.accountId);
  if (!account) throw new Error('Account not found');

  const newBalance = account.balance + income.amount;

  const transaction: Transaction = {
    id: uuidv4(),
    accountId: income.accountId,
    accountType: 'bank',
    date: income.date,
    amount: income.amount, // Positive for income
    type: 'deposit',
    description: income.description,
    category: income.category,
    balance: newBalance,
    incomeId: income.id,
    pending: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.transactions.add(transaction);
  await updateAccountBalanceForTransaction(income.accountId, 'bank', income.amount);
  await recalculateRunningBalances(income.accountId);
}

// ============================================================================
// UPDATE INCOME
// ============================================================================

export async function updateIncome(
  incomeId: string,
  updates: Partial<Income>
): Promise<Income> {
  await dbReady;
  const oldIncome = await db.incomes.get(incomeId);
  if (!oldIncome) throw new Error('Income not found');

  const amountChanged = updates.amount !== undefined && updates.amount !== oldIncome.amount;
  const accountChanged = updates.accountId !== undefined && updates.accountId !== oldIncome.accountId;
  const dateChanged = updates.date !== undefined && new Date(updates.date).getTime() !== new Date(oldIncome.date).getTime();

  try {
    await db.transaction('rw', db.incomes, db.transactions, db.accounts, db.creditCards, async () => {
      const updatedIncome = { ...oldIncome, ...updates, updatedAt: new Date() };
      await db.incomes.update(incomeId, updatedIncome);

      if (oldIncome.accountId || updates.accountId) {
        if (accountChanged) {
          await deleteTransactionForIncome(oldIncome.id);
          if (updatedIncome.accountId) {
            await createTransactionFromIncome(updatedIncome);
          }
          // Recalculate both old and new accounts
          if (oldIncome.accountId) {
            await recalculateRunningBalances(oldIncome.accountId);
          }
          if (updatedIncome.accountId && updatedIncome.accountId !== oldIncome.accountId) {
            await recalculateRunningBalances(updatedIncome.accountId);
          }
        } else if (amountChanged || dateChanged) {
          await updateTransactionForIncome(updatedIncome);
          if (dateChanged && updatedIncome.accountId) {
            await recalculateRunningBalances(updatedIncome.accountId);
          }
        }
      }
    });

    return { ...oldIncome, ...updates, updatedAt: new Date() };
  } catch (error) {
    console.error('Failed to update income:', error);
    throw new Error('Failed to update income. Please try again.');
  }
}

async function updateTransactionForIncome(income: Income): Promise<void> {
  await dbReady;
  const transaction = await db.transactions
    .where('incomeId')
    .equals(income.id)
    .and(t => !t.deletedAt)
    .first();

  if (!transaction) return;

  const amountDifference = income.amount - transaction.amount;

  await db.transactions.update(transaction.id, {
    amount: income.amount,
    date: income.date,
    description: income.description,
    category: income.category,
    updatedAt: new Date(),
  });

  if (amountDifference !== 0) {
    await updateAccountBalanceForTransaction(income.accountId!, 'bank', amountDifference);
  }

  await recalculateRunningBalances(income.accountId!);
}

// ============================================================================
// DELETE INCOME
// ============================================================================

export async function deleteIncome(incomeId: string): Promise<void> {
  await dbReady;
  const income = await db.incomes.get(incomeId);
  if (!income) throw new Error('Income not found');

  try {
    await db.transaction('rw', db.incomes, db.transactions, db.accounts, db.creditCards, async () => {
      if (income.accountId) {
        await deleteTransactionForIncome(incomeId);
      }

      await db.incomes.update(incomeId, {
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

      if (income.accountId) {
        await recalculateRunningBalances(income.accountId);
      }
    });
  } catch (error) {
    console.error('Failed to delete income:', error);
    throw new Error('Failed to delete income. Please try again.');
  }
}

async function deleteTransactionForIncome(incomeId: string): Promise<void> {
  await dbReady;
  const transaction = await db.transactions
    .where('incomeId')
    .equals(incomeId)
    .and(t => !t.deletedAt)
    .first();

  if (!transaction) return;

  const accountId = transaction.accountId;
  const amount = transaction.amount;

  await db.transactions.update(transaction.id, {
    deletedAt: new Date(),
    updatedAt: new Date(),
  });

  await updateAccountBalanceForTransaction(accountId, 'bank', -amount);
}
