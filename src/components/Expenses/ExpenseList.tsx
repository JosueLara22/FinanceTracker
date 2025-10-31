import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { Expense } from '../../types';

const ExpenseItem = ({ expense }: { expense: Expense }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border-b border-gray-200">
    <div>
      <p className="font-semibold text-gray-800">{expense.description}</p>
      <p className="text-sm text-gray-500">{expense.category} - {new Date(expense.date).toLocaleDateString()}</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-red-500">-${expense.amount.toLocaleString('es-MX')}</p>
      <p className="text-xs text-gray-400">{expense.paymentMethod}</p>
    </div>
  </div>
);

const ExpenseList = () => {
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray());

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Gastos Recientes</h3>
      <div className="space-y-4">
        {expenses && expenses.length > 0 ? (
          expenses.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No hay gastos registrados todavía.</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
