import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database, X } from 'lucide-react';
import { db } from '../data/db';
import {
  useExpenseStore,
  useIncomeStore,
  useAccountStore,
  useInvestmentStore,
  useTransferStore,
  useSettingsStore
} from '../stores';

export const DataBackup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = async () => {
    try {
      setIsExporting(true);
      setMessage(null);

      // Export all data from IndexedDB
      const data = {
        expenses: await db.expenses.toArray(),
        incomes: await db.incomes.toArray(),
        accounts: await db.accounts.toArray(),
        creditCards: await db.creditCards.toArray(),
        investments: await db.investments.toArray(),
        transactions: await db.transactions.toArray(),
        transfers: await db.transfers.toArray(),
        budgets: await db.budgets.toArray(),
        savingsGoals: await db.savingsGoals.toArray(),
        categories: await db.categories.toArray(),
        userSettings: await db.userSettings.toArray(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `Successfully exported ${data.expenses.length} expenses, ${data.incomes.length} incomes, and all other data!` });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);

      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.expenses || !data.incomes) {
        throw new Error('Invalid backup file format');
      }

      // Confirm before importing
      const confirmed = window.confirm(
        `This will import:\n` +
        `- ${data.expenses?.length || 0} expenses\n` +
        `- ${data.incomes?.length || 0} incomes\n` +
        `- ${data.accounts?.length || 0} bank accounts\n` +
        `- ${data.creditCards?.length || 0} credit cards\n` +
        `- ${data.investments?.length || 0} investments\n` +
        `- ${data.transfers?.length || 0} transfers\n\n` +
        `Do you want to MERGE with existing data or REPLACE all data?\n\n` +
        `Click OK to MERGE, Cancel to abort.`
      );

      if (!confirmed) {
        setMessage({ type: 'error', text: 'Import cancelled' });
        return;
      }

      // Import data to IndexedDB
      if (data.expenses?.length > 0) await db.expenses.bulkPut(data.expenses);
      if (data.incomes?.length > 0) await db.incomes.bulkPut(data.incomes);
      if (data.accounts?.length > 0) await db.accounts.bulkPut(data.accounts);
      if (data.creditCards?.length > 0) await db.creditCards.bulkPut(data.creditCards);
      if (data.investments?.length > 0) await db.investments.bulkPut(data.investments);
      if (data.transactions?.length > 0) await db.transactions.bulkPut(data.transactions);
      if (data.transfers?.length > 0) await db.transfers.bulkPut(data.transfers);
      if (data.budgets?.length > 0) await db.budgets.bulkPut(data.budgets);
      if (data.savingsGoals?.length > 0) await db.savingsGoals.bulkPut(data.savingsGoals);
      if (data.categories?.length > 0) await db.categories.bulkPut(data.categories);
      if (data.userSettings?.length > 0) await db.userSettings.bulkPut(data.userSettings);

      // Reload all stores
      await useExpenseStore.getState().loadExpenses();
      await useIncomeStore.getState().loadIncomes();
      await useAccountStore.getState().loadAccounts();
      await useAccountStore.getState().loadCreditCards();
      await useInvestmentStore.getState().loadInvestments();
      await useTransferStore.getState().loadTransfers();
      await useSettingsStore.getState().loadCategories();

      setMessage({
        type: 'success',
        text: `Successfully imported all data! Please refresh the page to see all changes.`
      });

      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file and try again.' });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const clearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your data!\n\n' +
      'This includes:\n' +
      '- All expenses\n' +
      '- All incomes\n' +
      '- All accounts\n' +
      '- All credit cards\n' +
      '- All investments\n' +
      '- All transfers\n' +
      '- Everything!\n\n' +
      'Are you ABSOLUTELY sure? This cannot be undone!'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm('Last chance! Type YES in the next prompt to confirm deletion.');
    if (!doubleConfirm) return;

    const userInput = window.prompt('Type YES to confirm deletion:');
    if (userInput !== 'YES') {
      setMessage({ type: 'error', text: 'Deletion cancelled' });
      return;
    }

    try {
      await db.expenses.clear();
      await db.incomes.clear();
      await db.accounts.clear();
      await db.creditCards.clear();
      await db.investments.clear();
      await db.transactions.clear();
      await db.transfers.clear();
      await db.budgets.clear();
      await db.savingsGoals.clear();

      setMessage({ type: 'success', text: 'All data has been cleared. Refreshing page...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Clear data error:', error);
      setMessage({ type: 'error', text: 'Failed to clear data' });
    }
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-50"
          title="Data Backup & Restore"
        >
          <Database className="w-6 h-6" />
        </button>
      )}

      {/* Backup Panel - Hidden by default */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6 max-w-md border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Backup & Restore</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-start ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            message.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Export Button */}
        <button
          onClick={exportData}
          disabled={isExporting}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export All Data'}
        </button>

        {/* Import Button */}
        <label className="w-full block">
          <input
            type="file"
            accept=".json"
            onChange={importData}
            disabled={isImporting}
            className="hidden"
          />
          <div className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            {isImporting ? 'Importing...' : 'Import Data from Backup'}
          </div>
        </label>

        {/* Clear Data Button */}
        <button
          onClick={clearAllData}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          Clear All Data
        </button>
      </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Export your data regularly to prevent data loss!
          </p>
        </div>
      )}
    </>
  );
};
