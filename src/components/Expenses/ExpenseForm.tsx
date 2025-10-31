import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Expense } from '../../types';

const ExpenseForm = () => {
  const { addExpense } = useAppContext();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) {
      alert('Please fill all fields');
      return;
    }

    const newExpense: Omit<Expense, 'id'> = {
      date: new Date(),
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod,
    };

    await addExpense(newExpense);

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Agregar Nuevo Gasto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Monto (e.g., 150.50)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Categoría (e.g., Comida)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Descripción (e.g., Café con amigos)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
        />
        <select 
          value={paymentMethod} 
          onChange={e => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
      <button type="submit" className="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
        + Agregar Gasto
      </button>
    </form>
  );
};

export default ExpenseForm;
