import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Transfer, Transaction } from '../types';
import { db } from '../data/db';
import { useTransactionStore } from './useTransactionStore';
import { useAccountStore } from './useAccountStore';

interface TransferState {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;

  // Transfer Actions
  setTransfers: (transfers: Transfer[]) => void;
  createTransfer: (transferData: Omit<Transfer, 'id' | 'fromTransactionId' | 'toTransactionId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Transfer>;
  updateTransfer: (id: string, updates: Partial<Transfer>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  getTransferById: (id: string) => Transfer | undefined;
  getTransfersByAccountId: (accountId: string) => Transfer[];
  loadTransfers: () => Promise<void>;

  // Validation
  validateTransfer: (fromAccountId: string, fromAccountType: 'bank' | 'credit', amount: number) => { valid: boolean; error?: string };

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransferStore = create<TransferState>()(
  devtools(
    (set, get) => ({
      transfers: [],
      isLoading: false,
      error: null,

      setTransfers: (transfers) => set({ transfers }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Load all transfers from database
      loadTransfers: async () => {
        try {
          set({ isLoading: true, error: null });
          const transfers = await db.transfers.toArray();
          set({ transfers, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load transfers',
            isLoading: false
          });
        }
      },

      // Validate transfer (check sufficient funds)
      validateTransfer: (fromAccountId, fromAccountType, amount) => {
        const accountStore = useAccountStore.getState();

        if (fromAccountType === 'bank') {
          const account = accountStore.getAccountById(fromAccountId);
          if (!account) {
            return { valid: false, error: 'Source account not found' };
          }
          if (account.balance < amount) {
            return { valid: false, error: 'Insufficient funds' };
          }
        } else {
          const card = accountStore.getCreditCardById(fromAccountId);
          if (!card) {
            return { valid: false, error: 'Source credit card not found' };
          }
          // For credit cards, check if amount exceeds available credit
          if (card.availableCredit < amount) {
            return { valid: false, error: 'Exceeds available credit' };
          }
        }

        return { valid: true };
      },

      // Create a new transfer with double-entry bookkeeping
      createTransfer: async (transferData) => {
        try {
          set({ isLoading: true, error: null });

          // Validate the transfer
          const validation = get().validateTransfer(
            transferData.fromAccountId,
            transferData.fromAccountType,
            transferData.amount
          );

          if (!validation.valid) {
            throw new Error(validation.error);
          }

          const now = new Date();
          const transactionStore = useTransactionStore.getState();
          const accountStore = useAccountStore.getState();

          // Create "from" transaction (debit)
          const fromTransaction = await transactionStore.addTransaction({
            accountId: transferData.fromAccountId,
            accountType: transferData.fromAccountType,
            date: transferData.date,
            amount: -transferData.amount, // Negative for debit
            type: 'transfer',
            description: `Transfer to ${transferData.toAccountId}`,
            balance: 0, // Will be updated below
            pending: false,
          });

          // Create "to" transaction (credit)
          const toTransaction = await transactionStore.addTransaction({
            accountId: transferData.toAccountId,
            accountType: transferData.toAccountType,
            date: transferData.date,
            amount: transferData.amount, // Positive for credit
            type: 'transfer',
            description: `Transfer from ${transferData.fromAccountId}`,
            balance: 0, // Will be updated below
            pending: false,
            relatedTransactionId: fromTransaction.id,
          });

          // Update the from transaction with related transaction ID
          await transactionStore.updateTransaction(fromTransaction.id, {
            relatedTransactionId: toTransaction.id,
          });

          // Create the transfer record
          const newTransfer: Transfer = {
            ...transferData,
            id: uuidv4(),
            fromTransactionId: fromTransaction.id,
            toTransactionId: toTransaction.id,
            status: 'completed',
            createdAt: now,
            updatedAt: now,
          };

          await db.transfers.add(newTransfer);

          // Update both transactions with transfer ID
          await transactionStore.updateTransaction(fromTransaction.id, {
            transferId: newTransfer.id,
          });
          await transactionStore.updateTransaction(toTransaction.id, {
            transferId: newTransfer.id,
          });

          // Update account balances
          if (transferData.fromAccountType === 'bank') {
            const account = accountStore.getAccountById(transferData.fromAccountId);
            if (account) {
              const newBalance = account.balance - transferData.amount;
              await accountStore.updateAccount(transferData.fromAccountId, {
                balance: newBalance,
                lastUpdate: now,
              });
              // Update transaction balance
              await transactionStore.updateTransaction(fromTransaction.id, {
                balance: newBalance,
              });
            }
          } else {
            const card = accountStore.getCreditCardById(transferData.fromAccountId);
            if (card) {
              const newBalance = card.currentBalance + transferData.amount;
              const newAvailable = card.creditLimit - newBalance;
              await accountStore.updateCreditCard(transferData.fromAccountId, {
                currentBalance: newBalance,
                availableCredit: newAvailable,
              });
              // Update transaction balance
              await transactionStore.updateTransaction(fromTransaction.id, {
                balance: newBalance,
              });
            }
          }

          if (transferData.toAccountType === 'bank') {
            const account = accountStore.getAccountById(transferData.toAccountId);
            if (account) {
              const newBalance = account.balance + transferData.amount;
              await accountStore.updateAccount(transferData.toAccountId, {
                balance: newBalance,
                lastUpdate: now,
              });
              // Update transaction balance
              await transactionStore.updateTransaction(toTransaction.id, {
                balance: newBalance,
              });
            }
          } else {
            const card = accountStore.getCreditCardById(transferData.toAccountId);
            if (card) {
              // For credit cards as destination (payments), decrease balance
              const newBalance = card.currentBalance - transferData.amount;
              const newAvailable = card.creditLimit - newBalance;
              await accountStore.updateCreditCard(transferData.toAccountId, {
                currentBalance: Math.max(0, newBalance),
                availableCredit: newAvailable,
              });
              // Update transaction balance
              await transactionStore.updateTransaction(toTransaction.id, {
                balance: Math.max(0, newBalance),
              });
            }
          }

          set((state) => ({
            transfers: [...state.transfers, newTransfer],
            isLoading: false,
          }));

          return newTransfer;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create transfer',
            isLoading: false
          });
          throw error;
        }
      },

      // Update a transfer
      updateTransfer: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          const updatedData = {
            ...updates,
            updatedAt: new Date(),
          };

          await db.transfers.update(id, updatedData);

          set((state) => ({
            transfers: state.transfers.map((t) =>
              t.id === id ? { ...t, ...updatedData } : t
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update transfer',
            isLoading: false
          });
          throw error;
        }
      },

      // Delete a transfer (also deletes associated transactions)
      deleteTransfer: async (id) => {
        try {
          set({ isLoading: true, error: null });

          const transfer = get().transfers.find((t) => t.id === id);
          if (!transfer) {
            throw new Error('Transfer not found');
          }

          const transactionStore = useTransactionStore.getState();

          // Delete both transactions
          await transactionStore.deleteTransaction(transfer.fromTransactionId);
          await transactionStore.deleteTransaction(transfer.toTransactionId);

          // Delete the transfer
          await db.transfers.delete(id);

          set((state) => ({
            transfers: state.transfers.filter((t) => t.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete transfer',
            isLoading: false
          });
          throw error;
        }
      },

      // Get transfer by ID
      getTransferById: (id) => {
        return get().transfers.find((t) => t.id === id);
      },

      // Get transfers by account ID (either from or to)
      getTransfersByAccountId: (accountId) => {
        return get().transfers.filter(
          (t) => t.fromAccountId === accountId || t.toAccountId === accountId
        );
      },
    }),
    { name: 'TransferStore' }
  )
);
