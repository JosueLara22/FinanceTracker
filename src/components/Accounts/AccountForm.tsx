import React, { useState } from 'react';
import { useAccounts } from '../../hooks/useAccounts'; // Adjust path as needed

interface AccountFormProps {
  onClose: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onClose }) => {
  const { addAccount } = useAccounts();
  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'investment' | 'credit card'>('checking');
  const [balance, setBalance] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || balance < 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    addAccount({
      bank,
      accountType,
      balance,
      accountNumber: '****', // Placeholder, as per spec, last 4 digits only
      currency: 'MXN', // Default currency
      lastUpdate: new Date(),
      isActive: true,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bank Name
        </label>
        <input
          type="text"
          id="bank"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Type
        </label>
        <select
          id="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings' | 'investment' | 'credit card')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="investment">Investment</option>
          <option value="credit card">Credit Card</option>
        </select>
      </div>
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Initial Balance
        </label>
        <input
          type="number"
          id="balance"
          value={balance}
          onChange={(e) => setBalance(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          min="0"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Add Account
        </button>
      </div>
    </form>
  );
};