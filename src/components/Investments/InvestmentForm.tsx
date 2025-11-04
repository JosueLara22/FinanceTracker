import React, { useState, useEffect } from 'react';
import { Investment } from '../../types';
import { useAccountStore } from '../../stores/useAccountStore';

interface InvestmentFormProps {
  onAddInvestment: (
    investment: Omit<Investment, 'id' | 'accumulatedReturns' | 'currentValue' | 'lastUpdate' | 'contributions' | 'withdrawals'>,
    sourceAccountId?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onAddInvestment }) => {
  const { accounts, loadAccounts } = useAccountStore();

  const [platform, setPlatform] = useState<'Nu' | 'Didi' | 'MercadoPago' | 'Other'>('Nu');
  const [type, setType] = useState('Cajita');
  const [initialCapital, setInitialCapital] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [gatPercentage, setGatPercentage] = useState('');
  const [autoReinvest, setAutoReinvest] = useState(true);
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Get available (active) accounts
  const availableAccounts = accounts.filter(acc => acc.isActive);

  // Get selected account details
  const selectedAccount = availableAccounts.find(acc => acc.id === sourceAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!platform || !initialCapital || !startDate || !gatPercentage) {
      setError('Please fill out all required fields.');
      return;
    }

    const capital = parseFloat(initialCapital);
    const gat = parseFloat(gatPercentage);

    if (capital <= 0 || gat < 0) {
      setError('Please enter valid positive numbers.');
      return;
    }

    // Validate sufficient funds if account selected
    if (sourceAccountId && selectedAccount) {
      if (selectedAccount.balance < capital) {
        setError(
          `Insufficient funds in ${selectedAccount.bankName}. Available: $${selectedAccount.balance.toFixed(2)}, Required: $${capital.toFixed(2)}`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calculate dailyReturn using compound interest formula
      const annualRate = gat / 100;
      const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;
      const dailyReturn = capital * dailyRate;

      const result = await onAddInvestment(
        {
          platform,
          type,
          initialCapital: capital,
          startDate: new Date(startDate),
          gatPercentage: gat,
          dailyReturn,
          autoReinvest,
        },
        sourceAccountId || undefined
      );

      if (result.success) {
        // Reset form on success
        setPlatform('Nu');
        setType('Cajita');
        setInitialCapital('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setGatPercentage('');
        setAutoReinvest(true);
        setSourceAccountId('');
        setError('');
      } else {
        setError(result.error || 'Failed to add investment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Account Selector */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source Account (Optional)
          </label>
          <select
            value={sourceAccountId}
            onChange={(e) => setSourceAccountId(e.target.value)}
            className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            <option value="">-- No Account (Manual Entry) --</option>
            {availableAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} - {account.accountType} (****{account.accountNumber}) -
                Balance: ${account.balance.toFixed(2)} {account.currency}
              </option>
            ))}
          </select>
          {selectedAccount && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Available: ${selectedAccount.balance.toFixed(2)} {selectedAccount.currency}
            </p>
          )}
        </div>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as 'Nu' | 'Didi' | 'MercadoPago' | 'Other')}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          required
        >
          <option value="Nu">Nu</option>
          <option value="Didi">Didi</option>
          <option value="MercadoPago">MercadoPago</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Type (e.g., Cajita, Inversión)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          required
        />
        <input
          type="number"
          placeholder="Initial Capital (MXN)"
          value={initialCapital}
          onChange={(e) => setInitialCapital(e.target.value)}
          min="0.01"
          step="0.01"
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="GAT % (Annual)"
          value={gatPercentage}
          onChange={(e) => setGatPercentage(e.target.value)}
          min="0"
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          required
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoReinvest"
            checked={autoReinvest}
            onChange={(e) => setAutoReinvest(e.target.checked)}
            className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="autoReinvest" className="dark:text-gray-300">Auto-reinvest?</label>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 dark:hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Adding Investment...' : 'Add Investment'}
      </button>
    </form>
  );
};