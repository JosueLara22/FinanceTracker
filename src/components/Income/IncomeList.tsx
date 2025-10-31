import React from 'react';
import { Income } from '../../types';

interface IncomeListProps {
  incomes: Income[];
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: Income) => void;
}

export const IncomeList: React.FC<IncomeListProps> = ({ incomes, onDeleteIncome, onEditIncome }) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (incomes.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No income recorded yet. Add one to get started!</p>;
  }

  return (
    <div className="space-y-4">
      {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(income => (
        <div key={income.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
          <div className="flex-1">
            <p className="font-bold text-lg dark:text-gray-300">{income.description}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {income.category} • {income.source}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">{formatDate(income.date)}</p>
            {income.recurring && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white rounded">
                Recurring
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-xl text-success">{formatCurrency(income.amount)}</p>
            <div className="flex items-center space-x-2 justify-end mt-2">
              <button
                onClick={() => onEditIncome(income)}
                className="text-sm text-primary-DEFAULT hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteIncome(income.id)}
                className="text-sm text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};