import React from 'react';
import { BankAccount } from '../../types'; // Adjust path as needed

interface AccountListProps {
  accounts: BankAccount[];
  onEditAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, onEditAccount, onDeleteAccount }) => {
  if (accounts.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">No accounts added yet. Add your first account!</p>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.bank}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.accountType}</p>
            <p className="text-md font-medium text-gray-700 dark:text-gray-300">
              Balance: ${account.balance.toFixed(2)} {account.currency}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditAccount(account.id)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteAccount(account.id)}
              className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
