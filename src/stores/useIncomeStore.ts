import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Income } from '../types';
import { db } from '../data/db';
import {
  createIncome as createIncomeUtil,
  updateIncome as updateIncomeUtil,
  deleteIncome as deleteIncomeUtil,
} from '../utils/incomeOperations';
import { useAccountStore } from './useAccountStore';

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
          // Filter out soft-deleted incomes
          const incomes = await db.incomes
            .filter(i => !i.deletedAt)
            .toArray();
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

          // Use the robust utility function
          const newIncome = await createIncomeUtil(incomeData);

          set((state) => ({
            incomes: [...state.incomes, newIncome],
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (newIncome.accountId) {
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
          }
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

          // Get old income to check if account changed
          const oldIncome = get().getIncomeById(id);

          // Use the robust utility function
          const updatedIncome = await updateIncomeUtil(id, updates);

          set((state) => ({
            incomes: state.incomes.map((income) =>
              income.id === id ? updatedIncome : income
            ),
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (oldIncome?.accountId || updatedIncome.accountId) {
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
          }
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

          // Get income before deleting to check if it has an account
          const income = get().getIncomeById(id);

          // Use the robust utility function (soft delete)
          await deleteIncomeUtil(id);

          // Filter out the deleted income from the state
          set((state) => ({
            incomes: state.incomes.filter((income) => income.id !== id),
            isLoading: false,
          }));

          // Reload accounts to reflect balance changes
          if (income?.accountId) {
            const accountStore = useAccountStore.getState();
            await accountStore.loadAccounts();
          }
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
