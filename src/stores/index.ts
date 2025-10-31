// Import all stores
import { useExpenseStore } from './useExpenseStore';
import { useIncomeStore } from './useIncomeStore';
import { useInvestmentStore } from './useInvestmentStore';
import { useAccountStore } from './useAccountStore';
import { useUIStore } from './useUIStore';
import { useSettingsStore } from './useSettingsStore';

// Re-export all store hooks
export {
  useExpenseStore,
  useIncomeStore,
  useInvestmentStore,
  useAccountStore,
  useUIStore,
  useSettingsStore
};

// Store initialization utility
export const initializeStores = async () => {
  // Load all data from IndexedDB
  await Promise.all([
    useExpenseStore.getState().loadExpenses(),
    useIncomeStore.getState().loadIncomes(),
    useInvestmentStore.getState().loadInvestments(),
    useAccountStore.getState().loadAccounts(),
    useAccountStore.getState().loadCreditCards(),
    useAccountStore.getState().loadBudgets(),
    useAccountStore.getState().loadSavingsGoals(),
    useSettingsStore.getState().loadUserSettings(),
    useSettingsStore.getState().loadCategories(),
  ]);

  // Initialize defaults if needed (first-time setup)
  await useSettingsStore.getState().initializeDefaults();
};

// Helper to get all store states (useful for debugging)
export const getAllStoreStates = () => {
  return {
    expenses: useExpenseStore.getState(),
    incomes: useIncomeStore.getState(),
    investments: useInvestmentStore.getState(),
    accounts: useAccountStore.getState(),
    ui: useUIStore.getState(),
    settings: useSettingsStore.getState(),
  };
};

// Helper to clear all store data (useful for logout/reset)
export const clearAllStores = async () => {
  const { db } = await import('../data/db');

  // Clear all database tables
  await Promise.all([
    db.expenses.clear(),
    db.incomes.clear(),
    db.investments.clear(),
    db.accounts.clear(),
    db.creditCards.clear(),
    db.budgets.clear(),
    db.savingsGoals.clear(),
    db.categories.clear(),
    db.userSettings.clear(),
  ]);

  // Reinitialize defaults
  await initializeStores();
};
