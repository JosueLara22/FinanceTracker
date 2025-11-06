import React from 'react';
import { Account } from '../../types';
import { Wallet } from 'lucide-react';
import { QuickBalanceUpdate } from './QuickBalanceUpdate';
import { useAccountStore } from '../../stores';
import { createBalanceAdjustment } from '../../utils/transactionUtils';

interface AccountListProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, onEditAccount, onDeleteAccount }) => {
  const { loadAccounts } = useAccountStore();

  const handleQuickBalanceUpdate = async (id: string, newBalance: number) => {
    try {
      // Create balance adjustment transaction
      await createBalanceAdjustment(id, newBalance);

      // Reload accounts to reflect the change
      await loadAccounts();
    } catch (error) {
      console.error('[AccountList] Failed to update balance:', error);
      alert('No se pudo actualizar el saldo. Por favor, inténtalo de nuevo.');
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Aún no se han agregado cuentas bancarias.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">¡Agrega tu primera cuenta para comenzar a rastrear!</p>
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
            {!account.isActive && (
              <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full">
                Inactiva
              </span>
            )}
          </div>

          <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {account.name}
            </h3>
            {account.type === 'bank' && account.bankName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{account.bankName}</p>
            )}
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Actual</p>
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
            Última actualización: {new Date(account.lastUpdate).toLocaleDateString()}
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onEditAccount(account)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
              data-testid={`edit-account-${account.id}`}>
              Editar
            </button>
            <button
              onClick={() => onDeleteAccount(account.id)}
              className="flex-1 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              data-testid={`delete-account-${account.id}`}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
