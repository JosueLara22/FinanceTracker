import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Investment } from '../types';
import { db } from '../data/db';

interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setInvestments: (investments: Investment[]) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  getInvestmentById: (id: string) => Investment | undefined;
  loadInvestments: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Calculation helpers
  calculateDailyReturn: (principal: number, gatPercentage: number) => number;
  calculateTotalROI: () => number;
}

export const useInvestmentStore = create<InvestmentState>()(
  devtools(
    (set, get) => ({
      investments: [],
      isLoading: false,
      error: null,

      setInvestments: (investments) => set({ investments }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      loadInvestments: async () => {
        try {
          set({ isLoading: true, error: null });
          const investments = await db.investments.toArray();
          set({ investments, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load investments',
            isLoading: false
          });
        }
      },

      addInvestment: async (investmentData) => {
        try {
          set({ isLoading: true, error: null });

          const newInvestment: Investment = {
            ...investmentData,
            id: uuidv4(),
          };

          await db.investments.add(newInvestment);

          set((state) => ({
            investments: [...state.investments, newInvestment],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add investment',
            isLoading: false
          });
          throw error;
        }
      },

      updateInvestment: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          await db.investments.update(id, updates);

          set((state) => ({
            investments: state.investments.map((investment) =>
              investment.id === id ? { ...investment, ...updates } : investment
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update investment',
            isLoading: false
          });
          throw error;
        }
      },

      deleteInvestment: async (id) => {
        try {
          set({ isLoading: true, error: null });

          await db.investments.delete(id);

          set((state) => ({
            investments: state.investments.filter((investment) => investment.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete investment',
            isLoading: false
          });
          throw error;
        }
      },

      getInvestmentById: (id) => {
        return get().investments.find((investment) => investment.id === id);
      },

      // Calculate daily return using compound interest formula
      calculateDailyReturn: (principal: number, gatPercentage: number) => {
        const annualRate = gatPercentage / 100;
        const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;
        return principal * dailyRate;
      },

      // Calculate total ROI across all investments
      calculateTotalROI: () => {
        const investments = get().investments;
        if (investments.length === 0) return 0;

        const totalInvested = investments.reduce(
          (sum, inv) => sum + inv.initialCapital,
          0
        );
        const totalCurrent = investments.reduce(
          (sum, inv) => sum + inv.currentValue,
          0
        );

        return totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
      },
    }),
    { name: 'InvestmentStore' }
  )
);
