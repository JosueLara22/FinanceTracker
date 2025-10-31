import React, { useState, useEffect } from 'react';
import { Expense } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { formatDateForInput } from '../../utils/formatters';

interface ExpenseFormProps {
  expense?: Expense;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onClose?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onAddExpense, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recurring, setRecurring] = useState(false);

  const { categories } = useCategories();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Get selected category details
  const selectedCategory = expenseCategories.find(c => c.name === category);

  // Initialize form with expense data if editing
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setDate(formatDateForInput(expense.date));
      setCategory(expense.category);
      setSubcategory(expense.subcategory || '');
      setPaymentMethod(expense.paymentMethod);
      setTags(expense.tags || []);
      setRecurring(expense.recurring || false);
    }
  }, [expense]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
      alert('Por favor completa todos los campos requeridos (Descripción, Monto, Fecha, Categoría).');
      return;
    }

    onAddExpense({
      date: new Date(date),
      amount: parseFloat(amount),
      category,
      subcategory: subcategory || undefined,
      description,
      paymentMethod,
      tags: tags.length > 0 ? tags : undefined,
      recurring,
    });

    // Reset form if not editing
    if (!expense) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setSubcategory('');
      setPaymentMethod('Credit Card');
      setTags([]);
      setRecurring(false);
    }

    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción *
        </label>
        <input
          type="text"
          placeholder="Ej: Compras en supermercado"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto (MXN) *
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría *
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory(''); // Reset subcategory when category changes
            }}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            required
          >
            <option value="" disabled>Seleccionar categoría</option>
            {expenseCategories.map(c => (
              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subcategoría
          </label>
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 ? (
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            >
              <option value="">Ninguna</option>
              {selectedCategory.subcategories.map((sub, index) => (
                <option key={index} value={sub}>{sub}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Ej: Restaurante"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Método de Pago *
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
          required
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

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Etiquetas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Agregar etiqueta"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Agregar
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recurring */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="recurring"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="mr-2 h-4 w-4 text-primary-DEFAULT focus:ring-primary-DEFAULT border-gray-300 rounded"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Gasto recurrente
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-DEFAULT text-white rounded-md hover:bg-primary-dark"
        >
          {expense ? 'Actualizar' : 'Agregar'} Gasto
        </button>
      </div>
    </form>
  );
};