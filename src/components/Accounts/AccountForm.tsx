import React, { useState, useEffect } from 'react';
import { useAccountStore } from '../../stores';
import { BankAccount } from '../../types';

interface AccountFormProps {
  onClose: () => void;
  accountToEdit?: BankAccount | null;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onClose, accountToEdit }) => {
  const { addAccount, updateAccount } = useAccountStore();

  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'investment' | 'credit card'>('checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [isActive, setIsActive] = useState(true);

  // Load existing account data if editing
  useEffect(() => {
    if (accountToEdit) {
      setBank(accountToEdit.bank);
      setAccountType(accountToEdit.accountType);
      setAccountNumber(accountToEdit.accountNumber);
      setBalance(accountToEdit.balance);
      setCurrency(accountToEdit.currency);
      setIsActive(accountToEdit.isActive);
    }
  }, [accountToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bank || !accountNumber || balance < 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const accountData = {
      bank,
      accountType,
      accountNumber,
      balance,
      currency,
      lastUpdate: new Date(),
      isActive,
    };

    try {
      if (accountToEdit) {
        await updateAccount(accountToEdit.id, accountData);
      } else {
        await addAccount(accountData);
      }
      onClose();
    } catch (error) {
      alert('Failed to save account. Please try again.');
      console.error('Error saving account:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="account-form">
      <div>
        <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bank Name
        </label>
        <input
          type="text"
          id="bank"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="e.g., BBVA, Santander, Nu"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="investment">Investment</option>
          <option value="credit card">Credit Card</option>
        </select>
      </div>

      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Number (Last 4 digits)
        </label>
        <input
          type="text"
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="****1234"
          maxLength={8}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Balance
          </label>
          <input
            type="number"
            id="balance"
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'MXN' | 'USD')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-DEFAULT border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Active Account
        </label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          data-testid="submit-button"
        >
          {accountToEdit ? 'Update Account' : 'Add Account'}
        </button>
      </div>
    </form>
  );
};