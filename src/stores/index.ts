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
  // First, initialize defaults (user settings, categories, and default bank accounts)
  // This will create default data if the database is empty
  await useSettingsStore.getState().initializeDefaults();

  // Load all data from IndexedDB
  await Promise.all([
    useExpenseStore.getState().loadExpenses(),
    useIncomeStore.getState().loadIncomes(),
    useInvestmentStore.getState().loadInvestments(),
    useAccountStore.getState().loadAccounts(),
    useAccountStore.getState().loadCreditCards(),
    useAccountStore.getState().loadBudgets(),
    useAccountStore.getState().loadSavingsGoals(),
  ]);

  // After stores are loaded, update investments with daily returns
  // This runs in the background and doesn't block the UI
  try {
    const { investmentUpdateService } = await import('../services/investmentUpdateService');

    // First, backfill historical data for any investments without snapshots
    await investmentUpdateService.backfillAllInvestments();

    // Then update all investments with any missed days
    await investmentUpdateService.updateAllInvestments();
  } catch (error) {
    console.error('Error updating investments on initialization:', error);
    // Don't throw - allow app to continue even if investment updates fail
  }
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
    db.investmentSnapshots.clear(),
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
