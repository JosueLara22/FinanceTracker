import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../types';
import { db, dbReady } from '../data/db';
import { useAccountStore } from './useAccountStore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Transaction Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByAccountId: (accountId: string) => Transaction[];
  getTransactionsByExpenseId: (expenseId: string) => Transaction[];
  getTransactionsByIncomeId: (incomeId: string) => Transaction[];
  getTransactionsByTransferId: (transferId: string) => Transaction[];
  loadTransactions: () => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Calculations
  recalculateAccountBalance: (accountId: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,

      setTransactions: (transactions) => set({ transactions }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Load all transactions from database
      loadTransactions: async () => {
        try {
          set({ isLoading: true, error: null });
          // Filter out soft-deleted transactions
          const transactions = await db.transactions
            .filter(t => !t.deletedAt)
            .toArray();
          set({ transactions, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load transactions',
            isLoading: false
          });
        }
      },

      // Add a new transaction
      addTransaction: async (transactionData) => {
        try {
          set({ isLoading: true, error: null });

          const now = new Date();
          const newTransaction: Transaction = {
            ...transactionData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
          };

          await db.transactions.add(newTransaction);

          set((state) => ({
            transactions: [...state.transactions, newTransaction],
            isLoading: false,
          }));

          await get().recalculateAccountBalance(newTransaction.accountId);

          return newTransaction;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add transaction',
            isLoading: false
          });
          throw error;
        }
      },

      // Update a transaction
      updateTransaction: async (id, updates) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          const updatedData = {
            ...updates,
            updatedAt: new Date(),
          };

          await db.transactions.update(id, updatedData);
          const transaction = get().getTransactionById(id);

          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updatedData } : t
            ),
            isLoading: false,
          }));

          if (transaction) {
            await get().recalculateAccountBalance(transaction.accountId);
            if (updates.accountId && updates.accountId !== transaction.accountId) {
              await get().recalculateAccountBalance(updates.accountId);
            }
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update transaction',
            isLoading: false
          });
          throw error;
        }
      },

      // Delete a transaction
      deleteTransaction: async (id) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          const transaction = get().getTransactionById(id);
          await db.transactions.delete(id);

          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
            isLoading: false,
          }));

          if (transaction) {
            await get().recalculateAccountBalance(transaction.accountId);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete transaction',
            isLoading: false
          });
          throw error;
        }
      },

      // Get transaction by ID
      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },

      // Get transactions by account ID
      getTransactionsByAccountId: (accountId) => {
        return get().transactions.filter((t) => t.accountId === accountId);
      },

      // Get transactions by expense ID
      getTransactionsByExpenseId: (expenseId) => {
        return get().transactions.filter((t) => t.expenseId === expenseId);
      },

      // Get transactions by income ID
      getTransactionsByIncomeId: (incomeId) => {
        return get().transactions.filter((t) => t.incomeId === incomeId);
      },

      // Get transactions by transfer ID
      getTransactionsByTransferId: (transferId) => {
        return get().transactions.filter((t) => t.transferId === transferId);
      },

      // Calculate balance after a transaction for an account
      calculateBalanceAfterTransaction: (accountId: string, amount: number) => {
        const accountTransactions = get()
          .transactions
          .filter((t) => t.accountId === accountId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (accountTransactions.length === 0) {
          return amount;
        }

        // Get the most recent balance and add the new amount
        const latestBalance = accountTransactions[0].balance;
        return latestBalance + amount;
      },

      recalculateAccountBalance: async (accountId: string) => {
        await dbReady;
        const accountStore = useAccountStore.getState();

        // Fetch transactions directly from the database for the specific account
        const accountTransactions = await db.transactions
          .where('accountId')
          .equals(accountId)
          .filter(t => !t.deletedAt) // Only consider non-deleted transactions
          .toArray();

        const newBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);

        const account = accountStore.getAccountById(accountId);
        if (account) {
          await accountStore.updateAccount(accountId, { balance: newBalance, lastUpdate: new Date() });
        } else {
          const creditCard = accountStore.getCreditCardById(accountId);
          if (creditCard) {
            const newCurrentBalance = -newBalance;
            const newAvailable = creditCard.creditLimit - newCurrentBalance;
            await accountStore.updateCreditCard(accountId, { currentBalance: newCurrentBalance, availableCredit: newAvailable });
          }
        }
      },
    }),
    { name: 'TransactionStore' }
  )
);
