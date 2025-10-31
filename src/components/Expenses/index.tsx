
import React, { useState } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm'; // Import ExpenseForm
import { useExpenses } from '../../hooks/useExpenses';

export const Expenses: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useExpenses(); // Add addExpense
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <button
          onClick={() => setExpenseFormOpen(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
        >
          Add New Expense
        </button>
      </div>

      <ExpenseList 
        expenses={expenses}
        onDeleteExpense={deleteExpense}
      />

      {isExpenseFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Expense</h3>
            <ExpenseForm 
              onAddExpense={(expense) => {
                addExpense(expense);
                setExpenseFormOpen(false);
              }}
              onClose={() => setExpenseFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
