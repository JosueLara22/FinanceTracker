import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Income } from '../types';
import { db } from '../data/db';

interface IncomeState {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setIncomes: (incomes: Income[]) => void;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  getIncomeById: (id: string) => Income | undefined;
  loadIncomes: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useIncomeStore = create<IncomeState>()(
  devtools(
    (set, get) => ({
      incomes: [],
      isLoading: false,
      error: null,

      setIncomes: (incomes) => set({ incomes }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      loadIncomes: async () => {
        try {
          set({ isLoading: true, error: null });
          const incomes = await db.incomes.toArray();
          set({ incomes, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load incomes',
            isLoading: false
          });
        }
      },

      addIncome: async (incomeData) => {
        try {
          set({ isLoading: true, error: null });

          const newIncome: Income = {
            ...incomeData,
            id: uuidv4(),
          };

          await db.incomes.add(newIncome);

          set((state) => ({
            incomes: [...state.incomes, newIncome],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add income',
            isLoading: false
          });
          throw error;
        }
      },

      updateIncome: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          await db.incomes.update(id, updates);

          set((state) => ({
            incomes: state.incomes.map((income) =>
              income.id === id ? { ...income, ...updates } : income
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update income',
            isLoading: false
          });
          throw error;
        }
      },

      deleteIncome: async (id) => {
        try {
          set({ isLoading: true, error: null });

          await db.incomes.delete(id);

          set((state) => ({
            incomes: state.incomes.filter((income) => income.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete income',
            isLoading: false
          });
          throw error;
        }
      },

      getIncomeById: (id) => {
        return get().incomes.find((income) => income.id === id);
      },
    }),
    { name: 'IncomeStore' }
  )
);
