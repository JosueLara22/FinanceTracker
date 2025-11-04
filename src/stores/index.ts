import { db } from '../data/db';

import { investmentUpdateService } from '../services/investmentUpdateService';

// Import all stores
import { useExpenseStore } from './useExpenseStore';
import { useIncomeStore } from './useIncomeStore';
import { useInvestmentStore } from './useInvestmentStore';
import { useAccountStore } from './useAccountStore';
import { useUIStore } from './useUIStore';
import { useSettingsStore } from './useSettingsStore';
import { useTransferStore } from './useTransferStore';

// Import validation utilities
import {
  runStartupValidations,
  autoFixBalanceDiscrepancies,
  reconcileAllAccounts,
  cleanupOrphanedTransactions,
} from '../utils/transactionUtils';

// Re-export all store hooks
export {
  useExpenseStore,
  useIncomeStore,
  useInvestmentStore,
  useAccountStore,
  useUIStore,
  useSettingsStore,
  useTransferStore
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

  // Run startup validations to check data integrity
  console.log('[Robustness] Running startup validations...');
  try {
    const validationReport = await runStartupValidations();

    if (validationReport.issuesFound > 0) {
      console.warn('[Robustness] Found data integrity issues:', validationReport);

      // If auto-fix is available for balance discrepancies, apply it
      if (validationReport.autoFixAvailable) {
        console.log('[Robustness] Auto-fixing balance discrepancies...');
        const fixReport = await autoFixBalanceDiscrepancies();
        console.log('[Robustness] Auto-fix complete:', fixReport);

        // Reload accounts to reflect fixed balances
        await useAccountStore.getState().loadAccounts();
        await useAccountStore.getState().loadCreditCards();
      }
    } else {
      console.log('[Robustness] All validation checks passed!');
    }
  } catch (error) {
    console.error('[Robustness] Error during startup validation:', error);
    // Don't throw - allow app to continue even if validation fails
  }

  // After stores are loaded, update investments with daily returns
  // This runs in the background and doesn't block the UI
  try {

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

// Helper for manual reconciliation (can be called from UI)
export const runManualReconciliation = async () => {
  console.log('[Robustness] Starting manual reconciliation...');

  try {
    // 1. Run validation checks
    const validationReport = await runStartupValidations();
    console.log('[Robustness] Validation report:', validationReport);

    // 2. Clean up orphaned transactions
    const orphanedCount = await cleanupOrphanedTransactions();
    console.log(`[Robustness] Cleaned up ${orphanedCount} orphaned transactions`);

    // 3. Reconcile all accounts
    const reconcileReport = await reconcileAllAccounts();
    console.log('[Robustness] Reconciliation report:', reconcileReport);

    // 4. Reload all accounts to reflect changes
    await useAccountStore.getState().loadAccounts();
    await useAccountStore.getState().loadCreditCards();

    return {
      validation: validationReport,
      orphanedCleaned: orphanedCount,
      reconciliation: reconcileReport,
    };
  } catch (error) {
    console.error('[Robustness] Manual reconciliation failed:', error);
    throw error;
  }
};

// Export validation utilities for advanced use
export {
  runStartupValidations,
  autoFixBalanceDiscrepancies,
  reconcileAllAccounts,
  cleanupOrphanedTransactions,
};
