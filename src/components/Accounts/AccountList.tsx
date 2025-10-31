import React from 'react';
import { BankAccount } from '../../types';
import { Wallet, TrendingUp, CreditCard, Landmark } from 'lucide-react';
import { QuickBalanceUpdate } from './QuickBalanceUpdate';
import { useAccountStore } from '../../stores';

interface AccountListProps {
  accounts: BankAccount[];
  onEditAccount: (account: BankAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, onEditAccount, onDeleteAccount }) => {
  const { updateAccount } = useAccountStore();

  const handleQuickBalanceUpdate = async (id: string, newBalance: number) => {
    try {
      await updateAccount(id, {
        balance: newBalance,
        lastUpdate: new Date(),
      });
    } catch (error) {
      alert('Failed to update balance. Please try again.');
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-6 w-6" />;
      case 'savings':
        return <Landmark className="h-6 w-6" />;
      case 'investment':
        return <TrendingUp className="h-6 w-6" />;
      case 'credit card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'text-blue-500';
      case 'savings':
        return 'text-green-500';
      case 'investment':
        return 'text-purple-500';
      case 'credit card':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No bank accounts added yet.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Add your first account to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="account-list">
      {accounts.map((account) => (
        <div
          key={account.id}
          className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border-l-4 ${
            account.isActive ? 'border-primary-DEFAULT' : 'border-gray-300'
          }`}
          data-testid={`account-card-${account.id}`}>

          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${getAccountTypeColor(account.accountType)}`}>
              {getAccountIcon(account.accountType)}
            </div>
            {!account.isActive && (
              <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full">
                Inactive
              </span>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{account.bank}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">{account.accountType}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Account: {account.accountNumber}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
              <QuickBalanceUpdate
                account={account}
                onUpdate={handleQuickBalanceUpdate}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`account-balance-${account.id}`}>
              {account.currency === 'MXN' ? '$' : 'US$'}{account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {account.currency}
            </p>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Last updated: {new Date(account.lastUpdate).toLocaleDateString()}
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onEditAccount(account)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
              data-testid={`edit-account-${account.id}`}>
              Edit
            </button>
            <button
              onClick={() => onDeleteAccount(account.id)}
              className="flex-1 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              data-testid={`delete-account-${account.id}`}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
