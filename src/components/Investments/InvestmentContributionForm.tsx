import React, { useState, FormEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useInvestmentStore } from '../../stores/useInvestmentStore';
import { useUIStore } from '../../stores/useUIStore';

interface InvestmentContributionFormProps {
  investmentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InvestmentContributionForm: React.FC<InvestmentContributionFormProps> = ({
  investmentId,
  onSuccess,
  onCancel,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { accounts } = useAccounts();
  const bankAccounts = accounts.filter((acc) => acc.type === 'bank');
  const { addContribution } = useInvestmentStore();
  const { showToast } = useUIStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount === '' || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!sourceAccountId) {
      setError('Please select a source account.');
      return;
    }

    setLoading(true);
    try {
      const result = await addContribution(
        investmentId,
        amount,
        sourceAccountId
      );

      if (result.success) {
        showToast('Contribution added successfully!', 'success');
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to add contribution.');
        showToast(result.error || 'Failed to add contribution.', 'error');
      }
    } catch (err) {
      console.error('Error adding contribution:', err);
      setError('An unexpected error occurred.');
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Contribution</h3>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          step="0.01"
          min="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="sourceAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Source Account
        </label>
        <select
          id="sourceAccount"
          value={sourceAccountId}
          onChange={(e) => setSourceAccountId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          disabled={loading}
        >
          <option value="">Select an account</option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} (Balance: ${account.balance.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Contribution'}
        </button>
      </div>
    </form>
  );
};

export default InvestmentContributionForm;
