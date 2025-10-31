import React, { useEffect } from 'react';
import { TransactionList } from './TransactionList';
import { useTransactionStore } from '../../stores/useTransactionStore';

export const Transactions: React.FC = () => {
  const { loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your transactions across accounts
        </p>
      </div>

      <TransactionList />
    </div>
  );
};

export { TransactionList };
