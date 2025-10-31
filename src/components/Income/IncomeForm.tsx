import React, { useState } from 'react';
import { Income } from '../../types';
import { useCategories } from '../../hooks/useCategories';

interface IncomeFormProps {
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onClose?: () => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ onAddIncome, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [recurring, setRecurring] = useState(false);

  const { categories } = useCategories();
  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category || !source) {
      alert('Please fill out all fields.');
      return;
    }

    onAddIncome({
      date: new Date(date),
      amount: parseFloat(amount),
      category,
      description,
      source,
      recurring,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setSource('');
    setRecurring(false);

    onClose?.(); // Close the modal on successful submission
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">Add New Income</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        >
          <option value="" disabled>Select Category</option>
          {incomeCategories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Source (e.g., Employer, Client)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
        />
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="mr-2 h-4 w-4 text-primary-DEFAULT rounded focus:ring-primary-DEFAULT border-gray-300"
          />
          <label htmlFor="recurring" className="text-gray-700 dark:text-gray-300">Recurring Income</label>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" className="bg-primary-DEFAULT text-white p-2 rounded-md hover:bg-primary-dark">
          Add Income
        </button>
      </div>
    </form>
  );
};