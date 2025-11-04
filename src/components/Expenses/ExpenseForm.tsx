import React, { useState, useEffect } from 'react';
import { Expense } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { useAccountStore } from '../../stores/useAccountStore';
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | 'credit' | 'transfer' | 'other'>('cash');
  const [accountId, setAccountId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recurring, setRecurring] = useState(false);

  const { categories } = useCategories();
  const { accounts, creditCards, loadAccounts, loadCreditCards } = useAccountStore();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const cashAccounts = accounts.filter(a => a.type === 'cash' && a.isActive);
  const bankAccounts = accounts.filter(a => a.type === 'bank' && a.isActive);

  const selectedCategory = expenseCategories.find(c => c.name === category);

  useEffect(() => {
    loadAccounts();
    loadCreditCards();
  }, [loadAccounts, loadCreditCards]);

  // Auto-select the single cash account if payment method is cash
  useEffect(() => {
    if (paymentMethod === 'cash') {
      if (cashAccounts.length === 1) {
        setAccountId(cashAccounts[0].id);
      } else {
        // If no cash account or more than one, clear the accountId
        setAccountId(''); 
      }
    }
  }, [paymentMethod, cashAccounts]);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setDate(formatDateForInput(expense.date));
      setCategory(expense.category);
      setSubcategory(expense.subcategory || '');
      setPaymentMethod(expense.paymentMethod);
      setAccountId(expense.accountId || '');
      setTags(expense.tags || []);
      setRecurring(expense.recurring || false);
    }
  }, [expense, accounts, creditCards]);

  useEffect(() => {
    if (expense && paymentMethod === 'credit' && creditCards.length > 0) {
      setAccountId(expense.accountId || '');
    }
  }, [expense, paymentMethod, creditCards]);

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
    if (!description || !amount || !date || !category || (paymentMethod !== 'other' && !accountId)) {
      alert('Por favor completa todos los campos requeridos. Si pagas en efectivo, asegúrate de haber creado una cuenta de efectivo.');
      return;
    }

    // Auto-link cash payments to "Efectivo" account
    let finalAccountId = accountId;
    if (paymentMethod === 'cash' && !accountId) {
      // Find an account named "Efectivo" or "Cash" (case insensitive)
      const cashAccount = accounts.find(acc =>
        acc.isActive &&
        (acc.bankName?.toLowerCase() === 'efectivo' || acc.bankName?.toLowerCase() === 'cash')
      );
      if (cashAccount) {
        finalAccountId = cashAccount.id;
      }
    }

    const now = new Date();
    onAddExpense({
      date: new Date(`${date}T00:00:00`),
      amount: parseFloat(amount),
      category,
      subcategory: subcategory || undefined,
      description,
      paymentMethod,
      accountId: finalAccountId || undefined,
      tags: tags.length > 0 ? tags : undefined,
      recurring,
      createdAt: expense?.createdAt || now,
      updatedAt: now,
    });

    if (!expense) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('');
      setSubcategory('');
      setPaymentMethod('cash');
      setAccountId('');
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
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Método de Pago *
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              const newPaymentMethod = e.target.value as 'cash' | 'debit' | 'credit' | 'transfer' | 'other';
              setPaymentMethod(newPaymentMethod);
              if (!expense || newPaymentMethod !== expense.paymentMethod) {
                setAccountId('');
              }
            }}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
            required
          >
            <option value="cash">Efectivo</option>
            <option value="debit">Tarjeta de Débito</option>
            <option value="credit">Tarjeta de Crédito</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Account/Card Selector - Hidden for 'cash' */}
        {(paymentMethod === 'debit' || paymentMethod === 'credit' || paymentMethod === 'transfer') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {paymentMethod === 'credit' ? 'Tarjeta de Crédito' : 'Cuenta Bancaria'} *
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
              required
            >
              <option value="">Seleccionar cuenta</option>
              {paymentMethod === 'credit' ? (
                creditCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.cardName} ({card.bank})
                  </option>
                ))
              ) : (
                bankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.bankName})
                  </option>
                ))
              )}
            </select>
          </div>
        )}
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
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
          >
            Agregar
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white"
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