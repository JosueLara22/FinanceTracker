/**
 * Robust Transfer Operations
 *
 * Implements the transaction lifecycle management for transfers
 * following the patterns from robustTransactions.md
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db';
import { Transfer, Transaction } from '../types';
import {
  recalculateRunningBalances,
  updateAccountBalanceForTransaction,
  getAccountName,
} from './transactionUtils';

// ============================================================================
// CREATE TRANSFER
// ============================================================================

export async function createTransfer(
  transferData: Omit<Transfer, 'id' | 'fromTransactionId' | 'toTransactionId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Transfer> {
  // Validate sufficient funds
  const fromAccount = transferData.fromAccountType === 'bank'
    ? await db.accounts.get(transferData.fromAccountId)
    : await db.creditCards.get(transferData.fromAccountId);

  if (!fromAccount) throw new Error('Source account not found');

  const fromBalance = transferData.fromAccountType === 'bank'
    ? (fromAccount as any).balance
    : (fromAccount as any).availableCredit;

  if (fromBalance < transferData.amount) {
    throw new Error('Insufficient funds for transfer');
  }

  const transfer: Transfer = {
    ...transferData,
    id: uuidv4(),
    fromTransactionId: '',  // Will be set below
    toTransactionId: '',    // Will be set below
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.transaction(
      'rw',
      db.transfers,
      db.transactions,
      db.accounts,
      db.creditCards,
      async () => {
        // Determine transaction amounts based on account types
        // For transfers, we always move money OUT of source and INTO destination
        //
        // Transfer semantics:
        // - Bank account: positive = money in, negative = money out
        // - Credit card: positive = debt increase (charge), negative = debt decrease (payment)
        //
        // Examples:
        // 1. Bank → Bank: source -$100, destination +$100
        // 2. Bank → Credit: source -$100 (money leaves bank), destination -$100 (debt decreases)
        // 3. Credit → Bank: source +$100 (debt increases - cash advance), destination +$100 (money arrives)
        // 4. Credit → Credit: source +$100 (debt increases), destination -$100 (debt decreases)

        let debitAmount: number;
        let creditAmount: number;

        // Source account (money leaving)
        if (transfer.fromAccountType === 'bank') {
          // Money leaving bank account
          debitAmount = -transfer.amount;
        } else {
          // Money leaving credit card = taking cash advance = debt increases
          debitAmount = transfer.amount;
        }

        // Destination account (money arriving)
        if (transfer.toAccountType === 'bank') {
          // Money arriving at bank account
          creditAmount = transfer.amount;
        } else {
          // Money arriving at credit card = payment = debt decreases
          creditAmount = -transfer.amount;
        }

        // 1. Create debit transaction (source account)
        const debitTransaction: Transaction = {
          id: uuidv4(),
          accountId: transfer.fromAccountId,
          accountType: transfer.fromAccountType,
          date: transfer.date,
          amount: debitAmount,
          type: 'transfer',
          description: `Transfer to ${await getAccountName(transfer.toAccountId, transfer.toAccountType)}`,
          balance: 0, // Will be calculated
          transferId: transfer.id,
          pending: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 2. Create credit transaction (destination account)
        const creditTransaction: Transaction = {
          id: uuidv4(),
          accountId: transfer.toAccountId,
          accountType: transfer.toAccountType,
          date: transfer.date,
          amount: creditAmount,
          type: 'transfer',
          description: `Transfer from ${await getAccountName(transfer.fromAccountId, transfer.fromAccountType)}`,
          balance: 0, // Will be calculated
          transferId: transfer.id,
          relatedTransactionId: debitTransaction.id,
          pending: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Link transactions
        debitTransaction.relatedTransactionId = creditTransaction.id;

        // Add transactions
        await db.transactions.add(debitTransaction);
        await db.transactions.add(creditTransaction);

        // Update transfer with transaction IDs
        transfer.fromTransactionId = debitTransaction.id;
        transfer.toTransactionId = creditTransaction.id;
        transfer.status = 'completed';

        // Save transfer
        await db.transfers.add(transfer);

        // Recalculate running balances (this will update account balances correctly)
        // We don't call updateAccountBalanceForTransaction because recalculateRunningBalances
        // will recalculate from transactions, which could reset to wrong values if there's no opening balance
        // Instead, we manually update the cached balances
        const fromAccount = transfer.fromAccountType === 'bank'
          ? await db.accounts.get(transfer.fromAccountId)
          : await db.creditCards.get(transfer.fromAccountId);

        const toAccount = transfer.toAccountType === 'bank'
          ? await db.accounts.get(transfer.toAccountId)
          : await db.creditCards.get(transfer.toAccountId);

        if (transfer.fromAccountType === 'bank' && fromAccount) {
          await db.accounts.update(transfer.fromAccountId, {
            balance: (fromAccount as any).balance + debitAmount,
            lastUpdate: new Date(),
          });
        } else if (fromAccount) {
          const newBalance = (fromAccount as any).currentBalance + debitAmount;
          await db.creditCards.update(transfer.fromAccountId, {
            currentBalance: newBalance,
            availableCredit: (fromAccount as any).creditLimit - newBalance,
            lastUpdate: new Date(),
          });
        }

        if (transfer.toAccountType === 'bank' && toAccount) {
          await db.accounts.update(transfer.toAccountId, {
            balance: (toAccount as any).balance + creditAmount,
            lastUpdate: new Date(),
          });
        } else if (toAccount) {
          const newBalance = (toAccount as any).currentBalance + creditAmount;
          await db.creditCards.update(transfer.toAccountId, {
            currentBalance: newBalance,
            availableCredit: (toAccount as any).creditLimit - newBalance,
            lastUpdate: new Date(),
          });
        }
      }
    );

    return transfer;
  } catch (error) {
    console.error('Failed to create transfer:', error);
    throw new Error('Failed to create transfer. Please try again.');
  }
}

// ============================================================================
// UPDATE TRANSFER
// ============================================================================

export async function updateTransfer(
  transferId: string,
  updates: Partial<Transfer>
): Promise<Transfer> {
  const oldTransfer = await db.transfers.get(transferId);
  if (!oldTransfer) throw new Error('Transfer not found');

  // Check what changed
  const amountChanged = updates.amount !== undefined && updates.amount !== oldTransfer.amount;
  const dateChanged = updates.date !== undefined && updates.date.getTime() !== oldTransfer.date.getTime();
  const fromAccountChanged = updates.fromAccountId !== undefined && updates.fromAccountId !== oldTransfer.fromAccountId;
  const toAccountChanged = updates.toAccountId !== undefined && updates.toAccountId !== oldTransfer.toAccountId;
  const accountsChanged = fromAccountChanged || toAccountChanged;

  try {
    await db.transaction(
      'rw',
      db.transfers,
      db.transactions,
      db.accounts,
      db.creditCards,
      async () => {
        if (accountsChanged) {
          // If accounts changed, need to completely recreate the transfer
          // 1. Reverse old transfer
          await db.transactions.update(oldTransfer.fromTransactionId, { deletedAt: new Date() });
          await db.transactions.update(oldTransfer.toTransactionId, { deletedAt: new Date() });
          await updateAccountBalanceForTransaction(oldTransfer.fromAccountId, oldTransfer.fromAccountType, oldTransfer.amount);
          await updateAccountBalanceForTransaction(oldTransfer.toAccountId, oldTransfer.toAccountType, -oldTransfer.amount);

          // 2. Create new transfer with updated data
          const updatedTransfer = { ...oldTransfer, ...updates };

          // Validate sufficient funds in new source account
          const fromAccount = updatedTransfer.fromAccountType === 'bank'
            ? await db.accounts.get(updatedTransfer.fromAccountId)
            : await db.creditCards.get(updatedTransfer.fromAccountId);

          if (!fromAccount) throw new Error('Source account not found');

          const fromBalance = updatedTransfer.fromAccountType === 'bank'
            ? (fromAccount as any).balance
            : (fromAccount as any).availableCredit;

          if (fromBalance < updatedTransfer.amount) {
            throw new Error('Insufficient funds in new source account');
          }

          // Create new transactions with correct amount logic
          let debitAmount: number;
          let creditAmount: number;

          // Source account (money leaving)
          if (updatedTransfer.fromAccountType === 'bank') {
            debitAmount = -updatedTransfer.amount;
          } else {
            debitAmount = updatedTransfer.amount;
          }

          // Destination account (money arriving)
          if (updatedTransfer.toAccountType === 'bank') {
            creditAmount = updatedTransfer.amount;
          } else {
            creditAmount = -updatedTransfer.amount;
          }

          const debitTransaction: Transaction = {
            id: uuidv4(),
            accountId: updatedTransfer.fromAccountId,
            accountType: updatedTransfer.fromAccountType,
            date: updatedTransfer.date,
            amount: debitAmount,
            type: 'transfer',
            description: `Transfer to ${await getAccountName(updatedTransfer.toAccountId, updatedTransfer.toAccountType)}`,
            balance: 0,
            transferId: updatedTransfer.id,
            pending: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const creditTransaction: Transaction = {
            id: uuidv4(),
            accountId: updatedTransfer.toAccountId,
            accountType: updatedTransfer.toAccountType,
            date: updatedTransfer.date,
            amount: creditAmount,
            type: 'transfer',
            description: `Transfer from ${await getAccountName(updatedTransfer.fromAccountId, updatedTransfer.fromAccountType)}`,
            balance: 0,
            transferId: updatedTransfer.id,
            relatedTransactionId: debitTransaction.id,
            pending: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          debitTransaction.relatedTransactionId = creditTransaction.id;

          await db.transactions.add(debitTransaction);
          await db.transactions.add(creditTransaction);

          // Update transfer with new transaction IDs
          updatedTransfer.fromTransactionId = debitTransaction.id;
          updatedTransfer.toTransactionId = creditTransaction.id;
          updatedTransfer.updatedAt = new Date();

          await db.transfers.update(transferId, updatedTransfer);

          // Update all affected account balances (use the calculated amounts)
          await updateAccountBalanceForTransaction(updatedTransfer.fromAccountId, updatedTransfer.fromAccountType, debitAmount);
          await updateAccountBalanceForTransaction(updatedTransfer.toAccountId, updatedTransfer.toAccountType, creditAmount);

          // Recalculate running balances for all 4 potentially affected accounts
          await recalculateRunningBalances(oldTransfer.fromAccountId);
          await recalculateRunningBalances(oldTransfer.toAccountId);
          if (fromAccountChanged) await recalculateRunningBalances(updatedTransfer.fromAccountId);
          if (toAccountChanged) await recalculateRunningBalances(updatedTransfer.toAccountId);

        } else if (amountChanged || dateChanged) {
          // Same accounts, but amount or date changed
          const updatedTransfer = { ...oldTransfer, ...updates, updatedAt: new Date() };
          const amountDifference = (updates.amount || oldTransfer.amount) - oldTransfer.amount;

          // Calculate new transaction amounts with correct logic
          let newDebitAmount: number;
          let newCreditAmount: number;

          if (oldTransfer.fromAccountType === 'bank') {
            newDebitAmount = -updatedTransfer.amount;
          } else {
            newDebitAmount = updatedTransfer.amount;
          }

          if (oldTransfer.toAccountType === 'bank') {
            newCreditAmount = updatedTransfer.amount;
          } else {
            newCreditAmount = -updatedTransfer.amount;
          }

          // Update both transactions
          await db.transactions.update(oldTransfer.fromTransactionId, {
            amount: newDebitAmount,
            date: updatedTransfer.date,
            updatedAt: new Date(),
          });

          await db.transactions.update(oldTransfer.toTransactionId, {
            amount: newCreditAmount,
            date: updatedTransfer.date,
            updatedAt: new Date(),
          });

          // Update transfer
          await db.transfers.update(transferId, updatedTransfer);

          // Adjust account balances if amount changed
          if (amountChanged) {
            // Calculate the difference in the correct direction for each account type
            let fromDifference: number;
            let toDifference: number;

            if (oldTransfer.fromAccountType === 'bank') {
              fromDifference = -amountDifference;
            } else {
              fromDifference = amountDifference;
            }

            if (oldTransfer.toAccountType === 'bank') {
              toDifference = amountDifference;
            } else {
              toDifference = -amountDifference;
            }

            await updateAccountBalanceForTransaction(oldTransfer.fromAccountId, oldTransfer.fromAccountType, fromDifference);
            await updateAccountBalanceForTransaction(oldTransfer.toAccountId, oldTransfer.toAccountType, toDifference);
          }

          // Recalculate running balances
          await recalculateRunningBalances(oldTransfer.fromAccountId);
          await recalculateRunningBalances(oldTransfer.toAccountId);
        } else {
          // Only description or other non-critical fields changed
          const updatedTransfer = { ...oldTransfer, ...updates, updatedAt: new Date() };
          await db.transfers.update(transferId, updatedTransfer);
        }
      }
    );

    return { ...oldTransfer, ...updates, updatedAt: new Date() };
  } catch (error) {
    console.error('Failed to update transfer:', error);
    throw new Error('Failed to update transfer. Please try again.');
  }
}

// ============================================================================
// DELETE TRANSFER
// ============================================================================

export async function deleteTransfer(transferId: string): Promise<void> {
  const transfer = await db.transfers.get(transferId);
  if (!transfer) throw new Error('Transfer not found');

  try {
    await db.transaction(
      'rw',
      db.transfers,
      db.transactions,
      db.accounts,
      db.creditCards,
      async () => {
        // Soft delete both transactions
        await db.transactions.update(transfer.fromTransactionId, {
          deletedAt: new Date(),
          updatedAt: new Date(),
        });
        await db.transactions.update(transfer.toTransactionId, {
          deletedAt: new Date(),
          updatedAt: new Date(),
        });

        // Reverse balance changes
        await updateAccountBalanceForTransaction(transfer.fromAccountId, transfer.fromAccountType, transfer.amount);
        await updateAccountBalanceForTransaction(transfer.toAccountId, transfer.toAccountType, -transfer.amount);

        // Soft delete transfer
        await db.transfers.update(transferId, {
          deletedAt: new Date(),
          updatedAt: new Date(),
        });

        // Recalculate running balances
        await recalculateRunningBalances(transfer.fromAccountId);
        await recalculateRunningBalances(transfer.toAccountId);
      }
    );
  } catch (error) {
    console.error('Failed to delete transfer:', error);
    throw new Error('Failed to delete transfer. Please try again.');
  }
}
