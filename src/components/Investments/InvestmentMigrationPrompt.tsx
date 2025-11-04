/**
 * Investment Migration Prompt
 *
 * Shows a prompt to users who have investments created before the account integration feature.
 * Allows them to link existing investments to bank accounts for better tracking.
 */

import React, { useState, useEffect } from 'react';
import { Investment } from '../../types';
import { useAccountStore } from '../../stores/useAccountStore';
import {
  getUnlinkedInvestments,
  linkInvestmentToAccount,
  shouldShowMigrationPrompt
} from '../../utils/investmentMigration';

export const InvestmentMigrationPrompt: React.FC = () => {
  const { accounts, loadAccounts } = useAccountStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [unlinkedInvestments, setUnlinkedInvestments] = useState<Investment[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<{ [investmentId: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMigrationNeeded = async () => {
      // Check if already dismissed this session
      const dismissed = sessionStorage.getItem('investmentMigrationDismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
        return;
      }

      const needed = await shouldShowMigrationPrompt();
      if (needed) {
        const investments = await getUnlinkedInvestments();
        setUnlinkedInvestments(investments);
        setShowPrompt(true);
        loadAccounts();
      }
    };

    checkMigrationNeeded();
  }, [loadAccounts]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    sessionStorage.setItem('investmentMigrationDismissed', 'true');
  };

  const handleAccountSelect = (investmentId: string, accountId: string) => {
    setSelectedAccounts(prev => ({
      ...prev,
      [investmentId]: accountId
    }));
  };

  const handleLinkInvestments = async () => {
    setIsProcessing(true);

    try {
      for (const investment of unlinkedInvestments) {
        const accountId = selectedAccounts[investment.id];
        if (accountId) {
          await linkInvestmentToAccount(investment.id, accountId);
        }
      }

      // Refresh the list
      const remaining = await getUnlinkedInvestments();
      setUnlinkedInvestments(remaining);

      if (remaining.length === 0) {
        setShowPrompt(false);
        alert('All investments have been linked successfully!');
      }
    } catch (error) {
      console.error('Error linking investments:', error);
      alert('An error occurred while linking investments. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipForNow = () => {
    handleDismiss();
  };

  if (!showPrompt || isDismissed || unlinkedInvestments.length === 0) {
    return null;
  }

  const activeAccounts = accounts.filter(acc => acc.isActive);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Link Investments to Accounts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                We've added a new feature to track which bank account funded each investment.
                Would you like to link your existing investments?
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is optional and for record-keeping only.
              No money will be moved. You can skip this and continue using the app normally.
            </p>
          </div>

          <div className="space-y-4">
            {unlinkedInvestments.map(investment => (
              <div
                key={investment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {investment.platform} - {investment.type}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Initial Capital: ${investment.initialCapital.toFixed(2)} |
                      Started: {new Date(investment.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex-shrink-0 w-full md:w-64">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Source Account (Optional)
                    </label>
                    <select
                      value={selectedAccounts[investment.id] || ''}
                      onChange={(e) => handleAccountSelect(investment.id, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">-- Skip this one --</option>
                      {activeAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} (****{account.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleLinkInvestments}
              disabled={isProcessing || Object.keys(selectedAccounts).length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Linking...' : 'Link Selected Investments'}
            </button>
            <button
              onClick={handleSkipForNow}
              disabled={isProcessing}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Skip for Now
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            You can always link investments later from the settings or by editing each investment.
          </p>
        </div>
      </div>
    </div>
  );
};
