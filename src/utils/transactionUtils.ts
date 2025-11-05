/**
 * Robust Transaction Management Utilities
 *
 * This module implements the core principles from robustTransactions.md:
 * - Single Source of Truth (Transactions are immutable)
 * - Atomicity (Use Dexie transactions)
 * - Audit Trail (Soft deletes, timestamps)
 * - Eventual Consistency (Validation and reconciliation)
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import { dbReady } from '../data/db';
import { Transaction } from '../types';

// ============================================================================
// BALANCE CALCULATION
// ============================================================================

/**
 * Recalculate account balance from all transactions
 * This is the source of truth for account balances
 *
 * NOTE: This function should NOT be called during normal transfer operations
 * because it doesn't account for opening balances. It's designed for reconciliation
 * and validation purposes only.
 */
export async function recalculateAccountBalance(accountId: string): Promise<number> {
  await dbReady;
  const transactions = await db.transactions
    .where('accountId')
    .equals(accountId)
    .and(t => !t.deletedAt && !t.pending)
    .sortBy('date');

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Determine account type and update
  const account = await db.accounts.get(accountId);
  if (account) {
    // Bank account
    await db.accounts.update(accountId, {
      balance: totalBalance,
      lastUpdate: new Date(),
      needsRecalculation: false,
      hasDiscrepancy: false,
    });
  } else {
    // Try credit card
    const creditCard = await db.creditCards.get(accountId);
    if (creditCard) {
      // For credit cards: positive transaction amounts = debt
      // The balance stored is the debt amount (currentBalance)
      const debtBalance = totalBalance;
      await db.creditCards.update(accountId, {
        currentBalance: debtBalance,
        availableCredit: creditCard.creditLimit - debtBalance,
        lastUpdate: new Date(),
        needsRecalculation: false,
        hasDiscrepancy: false,
      });
    }
  }

  return totalBalance;
}

/**
 * Validate that cached balance matches calculated balance from transactions
 */
export async function validateAccountBalance(accountId: string): Promise<{
  isValid: boolean;
  cachedBalance: number;
  actualBalance: number;
  difference: number;
}> {
  await dbReady;
  // Get current cached balance
  const account = await db.accounts.get(accountId);
  const creditCard = await db.creditCards.get(accountId);

  let cachedBalance = 0;
  if (account) {
    cachedBalance = account.balance;
  } else if (creditCard) {
    cachedBalance = creditCard.currentBalance;
  } else {
    throw new Error('Account not found');
  }

  // Calculate actual balance from transactions
  const transactions = await db.transactions
    .where('accountId')
    .equals(accountId)
    .and(t => !t.deletedAt && !t.pending)
    .toArray();

  const actualBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const difference = Math.abs(cachedBalance - actualBalance);

  return {
    isValid: difference < 0.01, // Allow 1 cent tolerance for rounding
    cachedBalance,
    actualBalance,
    difference,
  };
}

/**
 * Recalculate running balances for all transactions in an account
 * Call this when a past transaction is modified or deleted
 *
 * NOTE: This function updates the 'balance' field on each transaction (running balance)
 * but does NOT recalculate the account's cached balance. The account balance should be
 * updated separately by the calling code to maintain the opening balance.
 */
export async function recalculateRunningBalances(accountId: string): Promise<void> {
  await dbReady;
  // Get the current account balance (including opening balance)
  const account = await db.accounts.get(accountId);
  const creditCard = await db.creditCards.get(accountId);

  // Get current balance before any transactions
  let openingBalance = 0;
  if (account) {
    openingBalance = account.balance;
  } else if (creditCard) {
    openingBalance = creditCard.currentBalance;
  }

  const transactions = await db.transactions
    .where('accountId')
    .equals(accountId)
    .and(t => !t.deletedAt)
    .sortBy('date');

  // Calculate opening balance by subtracting all transaction amounts from current balance
  const totalTransactions = transactions
    .filter(t => !t.pending)
    .reduce((sum, t) => sum + t.amount, 0);

  const calculatedOpeningBalance = openingBalance - totalTransactions;

  // Now recalculate running balances starting from the opening balance
  let runningBalance = calculatedOpeningBalance;
  const updates: Array<{ id: string; balance: number }> = [];

  for (const transaction of transactions) {
    // Skip pending transactions for balance calculation
    if (!transaction.pending) {
      runningBalance += transaction.amount;
    }
    updates.push({
      id: transaction.id,
      balance: runningBalance,
    });
  }

  // Batch update all transactions
  await db.transaction('rw', db.transactions, async () => {
    for (const update of updates) {
      await db.transactions.update(update.id, { balance: update.balance });
    }
  });

  // DO NOT call recalculateAccountBalance() here - it would reset to 0!
  // The account balance is managed separately by the transaction operations
}

/**
 * Get account name for display purposes
 */
export async function getAccountName(accountId: string, accountType: 'bank' | 'credit'): Promise<string> {
  await dbReady;
  if (accountType === 'bank') {
    const account = await db.accounts.get(accountId);
    if (!account) return 'Unknown Account';
    return account.name || `${account.bankName} ****${account.accountNumber}`;
  } else {
    const card = await db.creditCards.get(accountId);
    if (!card) return 'Unknown Card';
    return `${card.bank} ${card.cardName}`;
  }
}

/**
 * Update account balance after a transaction
 * Used internally by transaction operations
 */
export async function updateAccountBalanceForTransaction(
  accountId: string,
  accountType: 'bank' | 'credit',
  amountChange: number
): Promise<void> {
  await dbReady;
  if (accountType === 'bank') {
    const account = await db.accounts.get(accountId);
    if (!account) throw new Error('Account not found');

    await db.accounts.update(accountId, {
      balance: account.balance + amountChange,
      lastUpdate: new Date(),
    });
  } else {
    const card = await db.creditCards.get(accountId);
    if (!card) throw new Error('Credit card not found');

    // For credit cards, we track debt as positive
    // Charges increase debt (positive amountChange)
    // Payments decrease debt (negative amountChange)
    const newBalance = card.currentBalance + amountChange;

    await db.creditCards.update(accountId, {
      currentBalance: newBalance,
      availableCredit: card.creditLimit - newBalance,
      lastUpdate: new Date(),
    });
  }
}

// ============================================================================
// DATA INTEGRITY VALIDATION
// ============================================================================

/**
 * Find transactions that reference deleted or non-existent expenses/incomes/transfers
 */
export async function findOrphanedTransactions(): Promise<Transaction[]> {
  await dbReady;
  const allTransactions = await db.transactions.toArray();
  const orphaned: Transaction[] = [];

  for (const transaction of allTransactions) {
    if (transaction.deletedAt) continue; // Skip already deleted

    // Check if linked expense/income/transfer exists
    if (transaction.expenseId) {
      const expense = await db.expenses.get(transaction.expenseId);
      if (!expense || expense.deletedAt) {
        orphaned.push(transaction);
      }
    } else if (transaction.incomeId) {
      const income = await db.incomes.get(transaction.incomeId);
      if (!income || income.deletedAt) {
        orphaned.push(transaction);
      }
    } else if (transaction.transferId) {
      const transfer = await db.transfers.get(transaction.transferId);
      if (!transfer || transfer.deletedAt) {
        orphaned.push(transaction);
      }
    }
  }

  return orphaned;
}

/**
 * Find transfers missing one or both transactions
 */
export async function findIncompleteTransfers(): Promise<import('../types').Transfer[]> {
  await dbReady;
  const allTransfers = await db.transfers.filter(t => !t.deletedAt).toArray();
  const incomplete: import('../types').Transfer[] = [];

  for (const transfer of allTransfers) {
    const fromTransaction = await db.transactions.get(transfer.fromTransactionId);
    const toTransaction = await db.transactions.get(transfer.toTransactionId);

    if (!fromTransaction || !toTransaction || fromTransaction.deletedAt || toTransaction.deletedAt) {
      incomplete.push(transfer);
    }
  }

  return incomplete;
}

/**
 * Find potential duplicate transactions
 * (same accountId, date, and amount)
 */
export async function findDuplicateTransactions(): Promise<Array<Transaction[]>> {
  await dbReady;
  const transactions = await db.transactions
    .filter(t => !t.deletedAt)
    .toArray();

  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const key = `${transaction.accountId}-${new Date(transaction.date).getTime()}-${transaction.amount}`;
    const group = groups.get(key) || [];
    group.push(transaction);
    groups.set(key, group);
  }

  return Array.from(groups.values()).filter(group => group.length > 1);
}

// ============================================================================
// RECONCILIATION
// ============================================================================

export interface ValidationIssue {
  severity: 'warning' | 'error';
  type: string;
  count?: number;
  accountId?: string;
  accountName?: string;
  cached?: number;
  actual?: number;
  difference?: number;
  action: string;
}

export interface ValidationReport {
  timestamp: Date;
  issuesFound: number;
  issues: ValidationIssue[];
  autoFixAvailable: boolean;
}

/**
 * Run comprehensive validation checks on startup
 */
export async function runStartupValidations(): Promise<ValidationReport> {
  await dbReady;
  console.log('Starting validation checks...');

  const issues: ValidationIssue[] = [];

  // 1. Check orphaned transactions
  const orphanedTransactions = await findOrphanedTransactions();
  if (orphanedTransactions.length > 0) {
    issues.push({
      severity: 'warning',
      type: 'orphaned_transactions',
      count: orphanedTransactions.length,
      action: 'Review and delete or link to correct records',
    });
  }

  // 2. Check balance discrepancies in bank accounts
  const accounts = await db.accounts.filter(a => !a.deletedAt).toArray();
  for (const account of accounts) {
    const validation = await validateAccountBalance(account.id);
    if (!validation.isValid) {
      issues.push({
        severity: 'error',
        type: 'balance_discrepancy',
        accountId: account.id,
        accountName: account.name || `${account.bankName} ****${account.accountNumber}`,
        cached: validation.cachedBalance,
        actual: validation.actualBalance,
        difference: validation.difference,
        action: 'Auto-fix available',
      });
    }
  }

  // 3. Check balance discrepancies in credit cards
  const creditCards = await db.creditCards.filter(c => !c.deletedAt).toArray();
  for (const card of creditCards) {
    const validation = await validateAccountBalance(card.id);
    if (!validation.isValid) {
      issues.push({
        severity: 'error',
        type: 'balance_discrepancy',
        accountId: card.id,
        accountName: `${card.bank} ${card.cardName}`,
        cached: validation.cachedBalance,
        actual: validation.actualBalance,
        difference: validation.difference,
        action: 'Auto-fix available',
      });
    }
  }

  // 4. Check for incomplete transfers
  const incompleteTransfers = await findIncompleteTransfers();
  if (incompleteTransfers.length > 0) {
    issues.push({
      severity: 'error',
      type: 'incomplete_transfers',
      count: incompleteTransfers.length,
      action: 'Manual review required',
    });
  }

  // 5. Check for duplicate transactions
  const duplicates = await findDuplicateTransactions();
  if (duplicates.length > 0) {
    issues.push({
      severity: 'warning',
      type: 'possible_duplicates',
      count: duplicates.length,
      action: 'Review and merge if confirmed',
    });
  }

  return {
    timestamp: new Date(),
    issuesFound: issues.length,
    issues,
    autoFixAvailable: issues.some(i => i.action.includes('Auto-fix')),
  };
}

export interface FixReport {
  timestamp: Date;
  accountsChecked: number;
  accountsFixed: number;
  accountsFailed: number;
  fixedIds: string[];
  failedIds: string[];
}

/**
 * Automatically fix balance discrepancies
 */
export async function autoFixBalanceDiscrepancies(): Promise<FixReport> {
  await dbReady;
  const fixed: string[] = [];
  const failed: string[] = [];
  let checked = 0;

  // Fix bank accounts
  const accounts = await db.accounts.filter(a => !a.deletedAt).toArray();
  for (const account of accounts) {
    checked++;
    try {
      const validation = await validateAccountBalance(account.id);

      if (!validation.isValid) {
        // Recalculate and update
        await recalculateAccountBalance(account.id);
        fixed.push(account.id);
      }
    } catch (error) {
      console.error(`Failed to fix account ${account.id}:`, error);
      failed.push(account.id);
    }
  }

  // Fix credit cards
  const cards = await db.creditCards.filter(c => !c.deletedAt).toArray();
  for (const card of cards) {
    checked++;
    try {
      const validation = await validateAccountBalance(card.id);

      if (!validation.isValid) {
        // Recalculate and update
        await recalculateAccountBalance(card.id);
        fixed.push(card.id);
      }
    } catch (error) {
      console.error(`Failed to fix card ${card.id}:`, error);
      failed.push(card.id);
    }
  }

  return {
    timestamp: new Date(),
    accountsChecked: checked,
    accountsFixed: fixed.length,
    accountsFailed: failed.length,
    fixedIds: fixed,
    failedIds: failed,
  };
}

/**
 * Clean up orphaned transactions
 */
export async function cleanupOrphanedTransactions(): Promise<number> {
  await dbReady;
  const orphaned = await findOrphanedTransactions();
  let deletedCount = 0;

  for (const transaction of orphaned) {
    try {
      // Soft delete the transaction
      await db.transactions.update(transaction.id, {
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

      // Reverse the balance change
      await updateAccountBalanceForTransaction(
        transaction.accountId,
        transaction.accountType,
        -transaction.amount
      );

      // Recalculate running balances
      await recalculateRunningBalances(transaction.accountId);

      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete orphaned transaction ${transaction.id}:`, error);
    }
  }

  return deletedCount;
}

/**
 * Reconcile all accounts - recalculate all balances
 */
export async function reconcileAllAccounts(): Promise<{
  startTime: Date;
  endTime: Date;
  duration: number;
  accountsProcessed: number;
  balancesFixed: number;
  errors: Array<{ accountId: string; error: string }>;
}> {
  await dbReady;
  const summary = {
    startTime: new Date(),
    endTime: new Date(),
    duration: 0,
    accountsProcessed: 0,
    balancesFixed: 0,
    errors: [] as Array<{ accountId: string; error: string }>,
  };

  try {
    // Bank accounts
    const accounts = await db.accounts.filter(a => !a.deletedAt).toArray();
    for (const account of accounts) {
      try {
        await recalculateAccountBalance(account.id);
        await recalculateRunningBalances(account.id);
        summary.accountsProcessed++;
        summary.balancesFixed++;
      } catch (error) {
        summary.errors.push({
          accountId: account.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Credit cards
    const cards = await db.creditCards.filter(c => !c.deletedAt).toArray();
    for (const card of cards) {
      try {
        await recalculateAccountBalance(card.id);
        await recalculateRunningBalances(card.id);
        summary.accountsProcessed++;
        summary.balancesFixed++;
      } catch (error) {
        summary.errors.push({
          accountId: card.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    summary.endTime = new Date();
    summary.duration = summary.endTime.getTime() - summary.startTime.getTime();
  } catch (error) {
    summary.errors.push({
      accountId: 'global',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return summary;
}

// ============================================================================
// BALANCE ADJUSTMENT
// ============================================================================

/**
 * Create a balance adjustment transaction when user manually updates balance
 * This ensures the transaction-based system stays in sync
 */
export async function createBalanceAdjustment(
  accountId: string,
  newBalance: number
): Promise<void> {
  await dbReady;
  try {
    // Get current account and determine type
    const account = await db.accounts.get(accountId);
    const creditCard = await db.creditCards.get(accountId);

    if (!account && !creditCard) {
      throw new Error('Account not found');
    }

    const isCredit = !!creditCard;
    const accountType: 'bank' | 'credit' = isCredit ? 'credit' : 'bank';
    const currentBalance = isCredit ? creditCard.currentBalance : account!.balance;

    // Calculate the difference
    const difference = newBalance - currentBalance;

    // If no difference, nothing to do
    if (Math.abs(difference) < 0.01) {
      return;
    }

    await db.transaction('rw', db.transactions, db.accounts, db.creditCards, async () => {
      // Create adjustment transaction
      const transaction: Transaction = {
        id: uuidv4(),
        accountId,
        accountType,
        date: new Date(),
        amount: difference,
        type: difference > 0 ? 'adjustment_increase' : 'adjustment_decrease',
        description: `Balance Adjustment: ${difference > 0 ? '+' : ''}${difference.toFixed(2)}`,
        category: 'Balance Adjustment',
        balance: newBalance,
        pending: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.transactions.add(transaction);
      console.log('[TransactionUtils] Balance adjustment transaction created:', transaction.id);

      // Update account balance
      await updateAccountBalanceForTransaction(accountId, accountType, difference);
      console.log('[TransactionUtils] Account balance updated');

      // Recalculate running balances to ensure consistency
      await recalculateRunningBalances(accountId);
      console.log('[TransactionUtils] Running balances recalculated');
    });
  } catch (error) {
    console.error('[TransactionUtils] Failed to create balance adjustment:', error);
    throw new Error('Failed to adjust balance. Please try again.');
  }
}
