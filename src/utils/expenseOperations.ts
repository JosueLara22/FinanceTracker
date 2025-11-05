/**
 * Robust Expense Operations
 *
 * Implements the transaction lifecycle management for expenses
 * following the patterns from robustTransactions.md
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import { dbReady } from '../data/db';
import { Expense, Transaction } from '../types';
import {
  recalculateRunningBalances,
  updateAccountBalanceForTransaction,
} from './transactionUtils';

// ============================================================================
// CREATE EXPENSE
// ============================================================================

export async function createExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
  await dbReady;
  const expense: Expense = {
    ...expenseData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    console.log('[ExpenseOps] Creating expense:', expense);

    await db.transaction('rw', db.expenses, db.transactions, db.accounts, db.creditCards, async () => {
      // 1. Save expense
      await db.expenses.add(expense);
      console.log('[ExpenseOps] Expense saved to DB');

      // 2. Create transaction if account involved
      // Note: We create transactions even for cash if there's an accountId (cash wallet tracking)
      if (expense.accountId) {
        console.log('[ExpenseOps] Creating transaction for account:', expense.accountId);
        await createTransactionFromExpense(expense);
      } else {
        console.log('[ExpenseOps] No accountId - skipping transaction creation');
      }
    });

    console.log('[ExpenseOps] Expense creation complete');
    return expense;
  } catch (error) {
    console.error('[ExpenseOps] Failed to create expense:', error);
    throw new Error('Failed to create expense. Please try again.');
  }
}

async function createTransactionFromExpense(expense: Expense): Promise<void> {
  await dbReady;
  if (!expense.accountId) return;

  const isCredit = expense.paymentMethod === 'credit';
  const accountType = isCredit ? 'credit' : 'bank';
  console.log('[ExpenseOps] Transaction type:', accountType, 'Payment method:', expense.paymentMethod);

  // Get current account balance
  let currentBalance = 0;
  if (isCredit) {
    const card = await db.creditCards.get(expense.accountId);
    if (!card) throw new Error('Credit card not found');
    currentBalance = card.currentBalance;
    console.log('[ExpenseOps] Credit card current balance:', currentBalance);
  } else {
    // For bank/cash accounts
    const account = await db.accounts.get(expense.accountId);
    if (!account) throw new Error('Account not found');
    currentBalance = account.balance;
    console.log('[ExpenseOps] Bank/cash account current balance:', currentBalance);
  }

  // For credit cards: positive amount increases debt
  // For bank/cash accounts: negative amount decreases balance
  const transactionAmount = isCredit ? expense.amount : -expense.amount;
  const newBalance = currentBalance + transactionAmount;
  console.log('[ExpenseOps] Transaction amount:', transactionAmount, 'New balance will be:', newBalance);

  // Create transaction
  const transaction: Transaction = {
    id: uuidv4(),
    accountId: expense.accountId,
    accountType,
    date: expense.date,
    amount: transactionAmount,
    type: isCredit ? 'charge' : 'withdrawal',
    description: expense.description,
    category: expense.category,
    balance: newBalance,
    expenseId: expense.id,
    pending: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.transactions.add(transaction);
  console.log('[ExpenseOps] Transaction created:', transaction.id);

  // Update account balance
  await updateAccountBalanceForTransaction(expense.accountId, accountType, transactionAmount);
  console.log('[ExpenseOps] Account balance updated');

  // Recalculate running balances
  await recalculateRunningBalances(expense.accountId);
  console.log('[ExpenseOps] Running balances recalculated');
}

// ============================================================================
// UPDATE EXPENSE
// ============================================================================

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<Expense> {
  await dbReady;
  const oldExpense = await db.expenses.get(expenseId);
  if (!oldExpense) throw new Error('Expense not found');

  const amountChanged = updates.amount !== undefined && updates.amount !== oldExpense.amount;
  const accountChanged = updates.accountId !== undefined && updates.accountId !== oldExpense.accountId;
  const dateChanged = updates.date !== undefined && updates.date.getTime() !== oldExpense.date.getTime();
  const paymentMethodChanged = updates.paymentMethod !== undefined && updates.paymentMethod !== oldExpense.paymentMethod;

  try {
    await db.transaction('rw', db.expenses, db.transactions, db.accounts, db.creditCards, async () => {
      // 1. Update expense
      const updatedExpense = { ...oldExpense, ...updates, updatedAt: new Date() };
      await db.expenses.update(expenseId, updatedExpense);

      // 2. Handle transaction updates
      if (oldExpense.accountId || updates.accountId) {
        // Payment method changed (e.g., debit -> credit or cash -> debit)
        // OR account changed - requires deleting old transaction and creating new one
        if (paymentMethodChanged || accountChanged) {
          // Delete old transaction and reverse balance
          await deleteTransactionForExpense(oldExpense.id);

          // Create new transaction if there's an account
          if (updatedExpense.accountId) {
            await createTransactionFromExpense(updatedExpense);
          }

          // Recalculate balances for all affected accounts
          if (oldExpense.accountId) {
            await recalculateRunningBalances(oldExpense.accountId);
          }
          if (updatedExpense.accountId && updatedExpense.accountId !== oldExpense.accountId) {
            await recalculateRunningBalances(updatedExpense.accountId);
          }
        } else if (amountChanged || dateChanged) {
          // Same account and payment method, but amount or date changed
          await updateTransactionForExpense(updatedExpense);

          // If date changed, recalculate running balances
          if (dateChanged && updatedExpense.accountId) {
            await recalculateRunningBalances(updatedExpense.accountId);
          }
        }
      }
    });

    return { ...oldExpense, ...updates, updatedAt: new Date() };
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense. Please try again.');
  }
}

async function updateTransactionForExpense(expense: Expense): Promise<void> {
  await dbReady;
  const transaction = await db.transactions
    .where('expenseId')
    .equals(expense.id)
    .and(t => !t.deletedAt)
    .first();

  if (!transaction) return;

  const isCredit = expense.paymentMethod === 'credit';
  const transactionAmount = isCredit ? expense.amount : -expense.amount;
  const amountDifference = transactionAmount - transaction.amount;

  // Update transaction
  await db.transactions.update(transaction.id, {
    amount: transactionAmount,
    date: expense.date,
    description: expense.description,
    category: expense.category,
    updatedAt: new Date(),
  });

  // Update account balance
  if (amountDifference !== 0) {
    await updateAccountBalanceForTransaction(
      expense.accountId!,
      isCredit ? 'credit' : 'bank',
      amountDifference
    );
  }

  // Recalculate running balances
  await recalculateRunningBalances(expense.accountId!);
}

// ============================================================================
// DELETE EXPENSE
// ============================================================================

export async function deleteExpense(expenseId: string): Promise<void> {
  await dbReady;
  const expense = await db.expenses.get(expenseId);
  if (!expense) throw new Error('Expense not found');

  try {
    await db.transaction('rw', db.expenses, db.transactions, db.accounts, db.creditCards, async () => {
      // 1. Delete associated transaction
      if (expense.accountId) {
        await deleteTransactionForExpense(expenseId);
      }

      // 2. Soft delete expense
      await db.expenses.update(expenseId, {
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. If account was involved, recalculate running balances
      if (expense.accountId) {
        await recalculateRunningBalances(expense.accountId);
      }
    });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense. Please try again.');
  }
}

async function deleteTransactionForExpense(expenseId: string): Promise<void> {
  await dbReady;
  const transaction = await db.transactions
    .where('expenseId')
    .equals(expenseId)
    .and(t => !t.deletedAt)
    .first();

  if (!transaction) return;

  const accountId = transaction.accountId;
  const accountType = transaction.accountType;
  const amount = transaction.amount;

  // Soft delete transaction
  await db.transactions.update(transaction.id, {
    deletedAt: new Date(),
    updatedAt: new Date(),
  });

  // Reverse the balance change
  await updateAccountBalanceForTransaction(accountId, accountType, -amount);
}
