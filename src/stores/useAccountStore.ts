import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { BankAccount, CreditCard, Budget, SavingsGoal } from '../types';
import { db } from '../data/db';

interface AccountState {
  // Bank Accounts
  accounts: BankAccount[];
  creditCards: CreditCard[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  error: string | null;

  // Bank Account Actions
  setAccounts: (accounts: BankAccount[]) => void;
  addAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => BankAccount | undefined;
  loadAccounts: () => Promise<void>;

  // Credit Card Actions
  setCreditCards: (cards: CreditCard[]) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  getCreditCardById: (id: string) => CreditCard | undefined;
  loadCreditCards: () => Promise<void>;

  // Budget Actions
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetById: (id: string) => Budget | undefined;
  loadBudgets: () => Promise<void>;

  // Savings Goal Actions
  setSavingsGoals: (goals: SavingsGoal[]) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  getSavingsGoalById: (id: string) => SavingsGoal | undefined;
  loadSavingsGoals: () => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Calculations
  calculateNetWorth: () => number;
  calculateTotalCreditUtilization: () => number;
}

export const useAccountStore = create<AccountState>()(
  devtools(
    (set, get) => ({
      accounts: [],
      creditCards: [],
      budgets: [],
      savingsGoals: [],
      isLoading: false,
      error: null,

      setAccounts: (accounts) => set({ accounts }),
      setCreditCards: (creditCards) => set({ creditCards }),
      setBudgets: (budgets) => set({ budgets }),
      setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Bank Account Methods
      loadAccounts: async () => {
        try {
          set({ isLoading: true, error: null });
          const accounts = await db.accounts.toArray();
          set({ accounts, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load accounts',
            isLoading: false
          });
        }
      },

      addAccount: async (accountData) => {
        try {
          set({ isLoading: true, error: null });
          const newAccount: BankAccount = { ...accountData, id: uuidv4() };
          await db.accounts.add(newAccount);
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add account',
            isLoading: false
          });
          throw error;
        }
      },

      updateAccount: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          await db.accounts.update(id, updates);
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.id === id ? { ...acc, ...updates } : acc
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update account',
            isLoading: false
          });
          throw error;
        }
      },

      deleteAccount: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await db.accounts.delete(id);
          set((state) => ({
            accounts: state.accounts.filter((acc) => acc.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete account',
            isLoading: false
          });
          throw error;
        }
      },

      getAccountById: (id) => {
        return get().accounts.find((acc) => acc.id === id);
      },

      // Credit Card Methods
      loadCreditCards: async () => {
        try {
          set({ isLoading: true, error: null });
          const creditCards = await db.creditCards.toArray();
          set({ creditCards, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load credit cards',
            isLoading: false
          });
        }
      },

      addCreditCard: async (cardData) => {
        try {
          set({ isLoading: true, error: null });
          const newCard: CreditCard = { ...cardData, id: uuidv4() };
          await db.creditCards.add(newCard);
          set((state) => ({
            creditCards: [...state.creditCards, newCard],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add credit card',
            isLoading: false
          });
          throw error;
        }
      },

      updateCreditCard: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          await db.creditCards.update(id, updates);
          set((state) => ({
            creditCards: state.creditCards.map((card) =>
              card.id === id ? { ...card, ...updates } : card
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update credit card',
            isLoading: false
          });
          throw error;
        }
      },

      deleteCreditCard: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await db.creditCards.delete(id);
          set((state) => ({
            creditCards: state.creditCards.filter((card) => card.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete credit card',
            isLoading: false
          });
          throw error;
        }
      },

      getCreditCardById: (id) => {
        return get().creditCards.find((card) => card.id === id);
      },

      // Budget Methods
      loadBudgets: async () => {
        try {
          set({ isLoading: true, error: null });
          const budgets = await db.budgets.toArray();
          set({ budgets, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load budgets',
            isLoading: false
          });
        }
      },

      addBudget: async (budgetData) => {
        try {
          set({ isLoading: true, error: null });
          const newBudget: Budget = { ...budgetData, id: uuidv4() };
          await db.budgets.add(newBudget);
          set((state) => ({
            budgets: [...state.budgets, newBudget],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add budget',
            isLoading: false
          });
          throw error;
        }
      },

      updateBudget: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          await db.budgets.update(id, updates);
          set((state) => ({
            budgets: state.budgets.map((budget) =>
              budget.id === id ? { ...budget, ...updates } : budget
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update budget',
            isLoading: false
          });
          throw error;
        }
      },

      deleteBudget: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await db.budgets.delete(id);
          set((state) => ({
            budgets: state.budgets.filter((budget) => budget.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete budget',
            isLoading: false
          });
          throw error;
        }
      },

      getBudgetById: (id) => {
        return get().budgets.find((budget) => budget.id === id);
      },

      // Savings Goal Methods
      loadSavingsGoals: async () => {
        try {
          set({ isLoading: true, error: null });
          const savingsGoals = await db.savingsGoals.toArray();
          set({ savingsGoals, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load savings goals',
            isLoading: false
          });
        }
      },

      addSavingsGoal: async (goalData) => {
        try {
          set({ isLoading: true, error: null });
          const newGoal: SavingsGoal = { ...goalData, id: uuidv4() };
          await db.savingsGoals.add(newGoal);
          set((state) => ({
            savingsGoals: [...state.savingsGoals, newGoal],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add savings goal',
            isLoading: false
          });
          throw error;
        }
      },

      updateSavingsGoal: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          await db.savingsGoals.update(id, updates);
          set((state) => ({
            savingsGoals: state.savingsGoals.map((goal) =>
              goal.id === id ? { ...goal, ...updates } : goal
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update savings goal',
            isLoading: false
          });
          throw error;
        }
      },

      deleteSavingsGoal: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await db.savingsGoals.delete(id);
          set((state) => ({
            savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete savings goal',
            isLoading: false
          });
          throw error;
        }
      },

      getSavingsGoalById: (id) => {
        return get().savingsGoals.find((goal) => goal.id === id);
      },

      // Calculation Methods
      calculateNetWorth: () => {
        const state = get();
        const totalBankBalance = state.accounts
          .filter((acc) => acc.isActive)
          .reduce((sum, acc) => sum + acc.balance, 0);

        const totalCreditDebt = state.creditCards.reduce(
          (sum, card) => sum + card.currentBalance,
          0
        );

        return totalBankBalance - totalCreditDebt;
      },

      calculateTotalCreditUtilization: () => {
        const state = get();
        const totalLimit = state.creditCards.reduce(
          (sum, card) => sum + card.creditLimit,
          0
        );
        const totalUsed = state.creditCards.reduce(
          (sum, card) => sum + card.currentBalance,
          0
        );

        return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
      },
    }),
    { name: 'AccountStore' }
  )
);
