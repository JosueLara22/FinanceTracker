import React, { useState, useEffect } from 'react';
import { useAccountStore } from '../../stores';
import { Account } from '../../types';

interface AccountFormProps {
  onClose: () => void;
  accountToEdit?: Account | null;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onClose, accountToEdit }) => {
  const { accounts, addAccount, updateAccount } = useAccountStore();

  const [type, setType] = useState<'bank' | 'cash'>('bank');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [isActive, setIsActive] = useState(true);

  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [accountNumber, setAccountNumber] = useState('');

  // Check if a cash account already exists, excluding the one being edited
  const cashAccountExists = accounts.some(acc => acc.type === 'cash' && acc.id !== accountToEdit?.id);

  useEffect(() => {
    if (accountToEdit) {
      setType(accountToEdit.type);
      setName(accountToEdit.name);
      setBalance(accountToEdit.balance);
      setCurrency(accountToEdit.currency);
      setIsActive(accountToEdit.isActive);
      
      if (accountToEdit.type === 'bank') {
        setBankName(accountToEdit.bankName || '');
        setAccountType(accountToEdit.accountType || 'checking');
        setAccountNumber(accountToEdit.accountNumber || '');
      }
    }
  }, [accountToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || (type === 'bank' && (!bankName || !accountNumber))) {
      alert('Please fill in all required fields.');
      return;
    }

    const commonData = {
      name,
      type,
      balance,
      currency,
      isActive,
      lastUpdate: new Date(),
      createdAt: accountToEdit?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let accountData: Partial<Account>;

    if (type === 'bank') {
      accountData = {
        ...commonData,
        bankName,
        accountType,
        accountNumber,
      };
    } else {
      accountData = commonData;
    }

    try {
      if (accountToEdit) {
        await updateAccount(accountToEdit.id, accountData);
      } else {
        await addAccount(accountData as Omit<Account, 'id'>);
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
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'bank' | 'cash')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={!!accountToEdit} // Disable type change when editing
        >
          <option value="bank">Bank Account</option>
          <option value="cash" disabled={cashAccountExists} title={cashAccountExists ? "You can only have one cash account." : ''}>
            Cash
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder={type === 'cash' ? "e.g., My Wallet, Efectivo" : "e.g., BBVA Debit, Santander Credit"}
          required
        />
      </div>

      {type === 'bank' && (
        <>
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bank Name
            </label>
            <input
              type="text"
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., BBVA, Santander, Nu"
              required={type === 'bank'}
            />
          </div>

          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bank Account Type
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
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
              maxLength={4}
              required={type === 'bank'}
            />
          </div>
        </>
      )}

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