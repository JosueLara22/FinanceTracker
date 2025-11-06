import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Transfer } from '../types';
import { db } from '../data/db';
import {
  createTransfer as createTransferUtil,
  updateTransfer as updateTransferUtil,
  deleteTransfer as deleteTransferUtil,
} from '../utils/transferOperations';

import { useTransactionStore } from './useTransactionStore';

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
          // Filter out soft-deleted transfers
          const transfers = await db.transfers
            .filter(t => !t.deletedAt)
            .toArray();
          set({ transfers, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load transfers',
            isLoading: false
          });
        }
      },

      // Validate transfer (check sufficient funds)
      // Note: Validation is now handled in the createTransferUtil function
      // This is kept for backward compatibility
      validateTransfer: (_fromAccountId, _fromAccountType, _amount) => {
        return { valid: true };
      },

      // Create a new transfer with double-entry bookkeeping
      createTransfer: async (transferData) => {
        try {
          set({ isLoading: true, error: null });

          // Use the robust utility function
          const newTransfer = await createTransferUtil(transferData);

          set((state) => ({
            transfers: [...state.transfers, newTransfer],
            isLoading: false,
          }));

          // Recalculate account balances to reflect changes in both accounts
          console.log('[TransferStore] Recalculating account balances after transfer creation');
          const transactionStore = useTransactionStore.getState();
          await transactionStore.recalculateAccountBalance(newTransfer.fromAccountId);
          await transactionStore.recalculateAccountBalance(newTransfer.toAccountId);
          console.log('[TransferStore] Account balances recalculated');

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

          // Use the robust utility function
          const updatedTransfer = await updateTransferUtil(id, updates);

          set((state) => ({
            transfers: state.transfers.map((t) =>
              t.id === id ? updatedTransfer : t
            ),
            isLoading: false,
          }));

          // Recalculate account balances to reflect changes in both accounts
          console.log('[TransferStore] Recalculating account balances after transfer update');
          const transactionStore = useTransactionStore.getState();
          await transactionStore.recalculateAccountBalance(updatedTransfer.fromAccountId);
          await transactionStore.recalculateAccountBalance(updatedTransfer.toAccountId);
          console.log('[TransferStore] Account balances recalculated');
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

          // Use the robust utility function (soft delete)
          await deleteTransferUtil(id);

          // Filter out the deleted transfer from the state
          set((state) => ({
            transfers: state.transfers.filter((t) => t.id !== id),
            isLoading: false,
          }));

          // Recalculate account balances to reflect changes in both accounts
          console.log('[TransferStore] Recalculating account balances after transfer deletion');
          const transactionStore = useTransactionStore.getState();
          // We need the original transfer to get the account IDs
          const originalTransfer = get().transfers.find(t => t.id === id);
          if (originalTransfer) {
            await transactionStore.recalculateAccountBalance(originalTransfer.fromAccountId);
            await transactionStore.recalculateAccountBalance(originalTransfer.toAccountId);
          }
          console.log('[TransferStore] Account balances recalculated');
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
