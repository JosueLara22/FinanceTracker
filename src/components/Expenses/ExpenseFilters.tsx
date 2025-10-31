import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useCategories } from '../../hooks/useCategories';
import { formatDateForInput } from '../../utils/formatters';
import { getUniquePaymentMethods } from '../../utils/filters';
import { Expense } from '../../types';

interface ExpenseFiltersProps {
  expenses: Expense[];
  onSearchChange: (search: string) => void;
  searchTerm: string;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  expenses,
  onSearchChange,
  searchTerm
}) => {
  const { filters, setExpenseFilters, resetFilters } = useUIStore();
  const { categories } = useCategories();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const paymentMethods = getUniquePaymentMethods(expenses);

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.expenses.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    setExpenseFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const handlePaymentMethodToggle = (method: string) => {
    const currentMethods = filters.expenses.paymentMethods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];

    setExpenseFilters({ paymentMethods: newMethods.length > 0 ? newMethods : undefined });
  };

  const handleDateFromChange = (date: string) => {
    setExpenseFilters({ dateFrom: date ? new Date(date) : undefined });
  };

  const handleDateToChange = (date: string) => {
    setExpenseFilters({ dateTo: date ? new Date(date) : undefined });
  };

  const handleMinAmountChange = (amount: string) => {
    setExpenseFilters({ minAmount: amount ? parseFloat(amount) : undefined });
  };

  const handleMaxAmountChange = (amount: string) => {
    setExpenseFilters({ maxAmount: amount ? parseFloat(amount) : undefined });
  };

  const handleResetFilters = () => {
    resetFilters();
    onSearchChange('');
  };

  const hasActiveFilters =
    searchTerm ||
    (filters.expenses.categories && filters.expenses.categories.length > 0) ||
    (filters.expenses.paymentMethods && filters.expenses.paymentMethods.length > 0) ||
    filters.expenses.dateFrom ||
    filters.expenses.dateTo ||
    filters.expenses.minAmount ||
    filters.expenses.maxAmount;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por descripción, categoría..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Quick Date Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => {
            const today = new Date();
            setExpenseFilters({ dateFrom: today, dateTo: today });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Hoy
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const startOfWeek = new Date(today);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            setExpenseFilters({ dateFrom: startOfWeek, dateTo: today });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Esta Semana
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            setExpenseFilters({ dateFrom: startOfMonth, dateTo: today });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Este Mes
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            setExpenseFilters({ dateFrom: startOfYear, dateTo: today });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Este Año
        </button>
      </div>

      {/* Toggle Advanced Filters */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-primary-DEFAULT hover:text-primary-dark mb-4 flex items-center"
      >
        {showAdvanced ? '▼' : '▶'} Filtros Avanzados
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.expenses.dateFrom ? formatDateForInput(filters.expenses.dateFrom) : ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.expenses.dateTo ? formatDateForInput(filters.expenses.dateTo) : ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto Mínimo
              </label>
              <input
                type="number"
                value={filters.expenses.minAmount || ''}
                onChange={(e) => handleMinAmountChange(e.target.value)}
                placeholder="$0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto Máximo
              </label>
              <input
                type="number"
                value={filters.expenses.maxAmount || ''}
                onChange={(e) => handleMaxAmountChange(e.target.value)}
                placeholder="$0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Categories */}
          {expenseCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categorías
              </label>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.expenses.categories?.includes(category.name)
                        ? 'bg-primary-DEFAULT text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {paymentMethods.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Métodos de Pago
              </label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePaymentMethodToggle(method)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.expenses.paymentMethods?.includes(method)
                        ? 'bg-primary-DEFAULT text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Filtros activos:</strong>
            {searchTerm && <span className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">Búsqueda: {searchTerm}</span>}
            {filters.expenses.categories && filters.expenses.categories.length > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                {filters.expenses.categories.length} categoría{filters.expenses.categories.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.expenses.paymentMethods && filters.expenses.paymentMethods.length > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                {filters.expenses.paymentMethods.length} método{filters.expenses.paymentMethods.length > 1 ? 's' : ''}
              </span>
            )}
            {(filters.expenses.dateFrom || filters.expenses.dateTo) && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">Rango de fechas</span>
            )}
            {(filters.expenses.minAmount || filters.expenses.maxAmount) && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">Rango de monto</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
