import React from 'react';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
  onEditExpense
}) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No se encontraron gastos
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Intenta ajustar los filtros o agrega un nuevo gasto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map(expense => (
        <div
          key={expense.id}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary-light dark:bg-primary-dark text-primary-dark dark:text-white">
                      {expense.category}
                    </span>
                    {expense.subcategory && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {expense.subcategory}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatDate(expense.date)}</span>
                    <span>•</span>
                    <span>{expense.paymentMethod}</span>
                  </div>
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {expense.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-xl text-danger">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onEditExpense(expense)}
              className="px-3 py-1 text-sm text-primary-DEFAULT hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-DEFAULT hover:underline transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
                  onDeleteExpense(expense.id);
                }
              }}
              className="px-3 py-1 text-sm text-danger hover:text-red-700 hover:underline transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};