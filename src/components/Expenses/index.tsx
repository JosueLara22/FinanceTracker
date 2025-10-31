
import React from 'react';
import { ExpenseList } from './ExpenseList';
import { useExpenses } from '../../hooks/useExpenses';

export const Expenses: React.FC = () => {
  const { expenses, updateExpense, deleteExpense } = useExpenses();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
      </div>

      <ExpenseList 
        expenses={expenses}
        onUpdateExpense={updateExpense}
        onDeleteExpense={deleteExpense}
      />
    </div>
  );
};
