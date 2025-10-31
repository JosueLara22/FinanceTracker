import React, { useState } from 'react';
import { IncomeList } from './IncomeList';
import { IncomeForm } from './IncomeForm';
import { useIncomes } from '../../hooks/useIncomes';

export const Income: React.FC = () => {
  const { incomes, addIncome, deleteIncome } = useIncomes();
  const [isIncomeFormOpen, setIncomeFormOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
        <button
          onClick={() => setIncomeFormOpen(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
        >
          Add New Income
        </button>
      </div>

      <IncomeList 
        incomes={incomes}
        onDeleteIncome={deleteIncome}
      />

      {isIncomeFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Income</h3>
            <IncomeForm 
              onAddIncome={(income) => {
                addIncome(income);
                setIncomeFormOpen(false);
              }}
              onClose={() => setIncomeFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};