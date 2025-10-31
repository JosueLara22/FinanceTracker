import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Expense } from '../types';
import { db } from '../data/db';

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
          const expenses = await db.expenses.toArray();
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

          const newExpense: Expense = {
            ...expenseData,
            id: uuidv4(),
          };

          await db.expenses.add(newExpense);

          set((state) => ({
            expenses: [...state.expenses, newExpense],
            isLoading: false,
          }));
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

          await db.expenses.update(id, updates);

          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...updates } : expense
            ),
            isLoading: false,
          }));
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

          await db.expenses.delete(id);

          set((state) => ({
            expenses: state.expenses.filter((expense) => expense.id !== id),
            isLoading: false,
          }));
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
