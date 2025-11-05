import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Investment, InvestmentContribution, InvestmentWithdrawal, Transaction } from '../types';
import { db, dbReady } from '../data/db';
import {
  createInvestmentWithAccountDeduction,
  addContributionWithAccountDeduction,
  processWithdrawalToAccount,
  getInvestmentContributions,
  getInvestmentWithdrawals,
  getTotalInvested
} from '../services/investmentTransactions';
import { useAccountStore } from './useAccountStore';
import { useTransactionStore } from './useTransactionStore';

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
  deleteInvestment: (id: string, destinationAccountId?: string) => Promise<void>;
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
          await dbReady;
          const investments = await db.investments.filter(i => !i.deletedAt).toArray();
          set({ investments, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load investments',
            isLoading: false
          });
        }
      },

            addInvestment: async (

              investmentData,

              sourceAccountId

            ) => {

              await dbReady;

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
        await dbReady;
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
        await dbReady;
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
        await dbReady;
        return await getInvestmentContributions(investmentId);
      },

      getWithdrawals: async (investmentId) => {
        await dbReady;
        return await getInvestmentWithdrawals(investmentId);
      },

      getTotalInvestedAmount: async (investmentId) => {
        await dbReady;
        return await getTotalInvested(investmentId);
      },

      updateInvestment: async (id, updates) => {
        await dbReady;
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

      deleteInvestment: async (id, destinationAccountId) => {
        await dbReady;
        try {
          set({ isLoading: true, error: null });

          const investmentToDelete = get().investments.find(inv => inv.id === id);
          if (!investmentToDelete) {
            throw new Error('Investment not found');
          }

          const now = new Date();
          await db.investments.update(id, { deletedAt: now });
          await db.investmentSnapshots.where({ investmentId: id }).modify({ deletedAt: now });
          await db.investmentContributions.where({ investmentId: id }).modify({ deletedAt: now });
          await db.investmentWithdrawals.where({ investmentId: id }).modify({ deletedAt: now });

          // Optional: Handle fund transfer
          if (destinationAccountId && investmentToDelete.currentValue > 0) {
            const transactionStore = useTransactionStore.getState();
            const accountStore = useAccountStore.getState();

            const destinationAccount = accountStore.getAccountById(destinationAccountId);
            if (!destinationAccount) {
              console.warn(`Destination account ${destinationAccountId} not found for transfer.`);
            } else {
              const transferTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
                accountId: destinationAccountId,
                accountType: 'bank',
                date: now,
                amount: investmentToDelete.currentValue,
                type: 'deposit',
                description: `Transfer from deleted investment: ${investmentToDelete.platform} - ${investmentToDelete.type}`,
                balance: destinationAccount.balance + investmentToDelete.currentValue, // This will be recalculated by recalculateAccountBalance
                pending: false,
              };
              await transactionStore.addTransaction(transferTransaction);
            }
          }

          set((state) => ({
            investments: state.investments.map((investment) =>
              investment.id === id ? { ...investment, deletedAt: now } : investment
            ),
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
        return get().investments.find((investment) => investment.id === id && !investment.deletedAt);
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
