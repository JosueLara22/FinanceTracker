import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Investment, InvestmentContribution, InvestmentWithdrawal } from '../types';
import { db } from '../data/db';
import {
  createInvestmentWithAccountDeduction,
  addContributionWithAccountDeduction,
  processWithdrawalToAccount,
  getInvestmentContributions,
  getInvestmentWithdrawals,
  getTotalInvested
} from '../services/investmentTransactions';

interface InvestmentState {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setInvestments: (investments: Investment[]) => void;
  addInvestment: (
    investment: Omit<Investment, 'id' | 'accumulatedReturns' | 'currentValue' | 'lastUpdate' | 'contributions' | 'withdrawals'>,
    sourceAccountId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  addContribution: (
    investmentId: string,
    amount: number,
    sourceAccountId?: string,
    source?: string
  ) => Promise<{ success: boolean; error?: string }>;
  addWithdrawal: (
    investmentId: string,
    amount: number,
    destinationAccountId?: string,
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  getInvestmentById: (id: string) => Investment | undefined;
  getContributions: (investmentId: string) => Promise<InvestmentContribution[]>;
  getWithdrawals: (investmentId: string) => Promise<InvestmentWithdrawal[]>;
  getTotalInvestedAmount: (investmentId: string) => Promise<number>;
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

      addInvestment: async (investmentData, sourceAccountId) => {
        try {
          set({ isLoading: true, error: null });

          const result = await createInvestmentWithAccountDeduction(
            investmentData,
            sourceAccountId
          );

          if (!result.success || !result.investment) {
            set({ error: result.error || 'Failed to add investment', isLoading: false });
            return { success: false, error: result.error };
          }

          set((state) => ({
            investments: [...state.investments, result.investment!],
            isLoading: false,
          }));

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add investment';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      addContribution: async (investmentId, amount, sourceAccountId, source) => {
        try {
          set({ isLoading: true, error: null });

          const result = await addContributionWithAccountDeduction(
            investmentId,
            amount,
            sourceAccountId,
            source
          );

          if (!result.success) {
            set({ error: result.error || 'Failed to add contribution', isLoading: false });
            return { success: false, error: result.error };
          }

          // Reload the investment to get updated currentValue
          const updatedInvestment = await db.investments.get(investmentId);
          if (updatedInvestment) {
            set((state) => ({
              investments: state.investments.map((inv) =>
                inv.id === investmentId ? updatedInvestment : inv
              ),
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add contribution';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      addWithdrawal: async (investmentId, amount, destinationAccountId, reason) => {
        try {
          set({ isLoading: true, error: null });

          const result = await processWithdrawalToAccount(
            investmentId,
            amount,
            destinationAccountId,
            reason
          );

          if (!result.success) {
            set({ error: result.error || 'Failed to process withdrawal', isLoading: false });
            return { success: false, error: result.error };
          }

          // Reload the investment to get updated currentValue
          const updatedInvestment = await db.investments.get(investmentId);
          if (updatedInvestment) {
            set((state) => ({
              investments: state.investments.map((inv) =>
                inv.id === investmentId ? updatedInvestment : inv
              ),
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      getContributions: async (investmentId) => {
        return await getInvestmentContributions(investmentId);
      },

      getWithdrawals: async (investmentId) => {
        return await getInvestmentWithdrawals(investmentId);
      },

      getTotalInvestedAmount: async (investmentId) => {
        return await getTotalInvested(investmentId);
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
