import React, { useState } from 'react';
import { Expense } from '../../types';
import { useCategories } from '../../hooks/useCategories';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onClose?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const { categories } = useCategories();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
      alert('Please fill out all fields.');
      return;
    }

    onAddExpense({
      date: new Date(date),
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setPaymentMethod('Credit Card');

    onClose?.(); // Close the modal on successful submission
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">Add New Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        />
        <input
          type="number"
          placeholder="Amount (MXN)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        />
        <select
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        >
          <option value="" disabled>Select Category</option>
          {expenseCategories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
         <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        >
          <option>Credit Card</option>
          <option>Debit Card</option>
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Nu</option>
          <option>Didi</option>
          <option>MercadoPago</option>
        </select>
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" className="bg-primary-DEFAULT text-white p-2 rounded-md hover:bg-primary-dark">
          Add Expense
        </button>
      </div>
    </form>
  );
};