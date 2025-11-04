import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Expense } from '../types';
import { db } from '../data/db';
import {
  createExpense as createExpenseUtil,
  updateExpense as updateExpenseUtil,
  deleteExpense as deleteExpenseUtil,
} from '../utils/expenseOperations';
import { useAccountStore } from './useAccountStore';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
  loadExpenses: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  devtools(
    (set, get) => ({
      expenses: [],
      isLoading: false,
      error: null,

      setExpenses: (expenses) => set({ expenses }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      loadExpenses: async () => {
        try {
          set({ isLoading: true, error: null });
          // Filter out soft-deleted expenses
          const expenses = await db.expenses
            .filter(e => !e.deletedAt)
            .toArray();
          set({ expenses, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load expenses',
            isLoading: false
          });
        }
      },

      addExpense: async (expenseData) => {
        try {
          set({ isLoading: true, error: null });

          // Use the robust utility function
          const newExpense = await createExpenseUtil(expenseData);

          set((state) => ({
            expenses: [...state.expenses, newExpense],
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (newExpense.accountId) {
            console.log('[ExpenseStore] Reloading accounts after expense creation');
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
            await accountStore.loadCreditCards();
            console.log('[ExpenseStore] Accounts reloaded');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add expense',
            isLoading: false
          });
          throw error;
        }
      },

      updateExpense: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          // Get old expense to check if account changed
          const oldExpense = get().getExpenseById(id);

          // Use the robust utility function
          const updatedExpense = await updateExpenseUtil(id, updates);

          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id ? updatedExpense : expense
            ),
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (oldExpense?.accountId || updatedExpense.accountId) {
            console.log('[ExpenseStore] Reloading accounts after expense update');
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
            await accountStore.loadCreditCards();
            console.log('[ExpenseStore] Accounts reloaded');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update expense',
            isLoading: false
          });
          throw error;
        }
      },

      deleteExpense: async (id) => {
        try {
          set({ isLoading: true, error: null });

          // Get expense before deleting to check if it has an account
          const expense = get().getExpenseById(id);

          // Use the robust utility function (soft delete)
          await deleteExpenseUtil(id);

          // Filter out the deleted expense from the state
          set((state) => ({
            expenses: state.expenses.filter((expense) => expense.id !== id),
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (expense?.accountId) {
            console.log('[ExpenseStore] Reloading accounts after expense deletion');
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
            await accountStore.loadCreditCards();
            console.log('[ExpenseStore] Accounts reloaded');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete expense',
            isLoading: false
          });
          throw error;
        }
      },

      getExpenseById: (id) => {
        return get().expenses.find((expense) => expense.id === id);
      },
    }),
    { name: 'ExpenseStore' }
  )
);
