import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useCategories } from '../../hooks/useCategories';
import { formatDateForInput } from '../../utils/formatters';
import { Income } from '../../types';

interface IncomeFiltersProps {
  incomes: Income[];
  onSearchChange: (search: string) => void;
  searchTerm: string;
}

// Helper to get unique sources from incomes
const getUniqueSources = (incomes: Income[]): string[] => {
  const sources = new Set<string>();
  incomes.forEach((income) => {
    if (income.source) {
      sources.add(income.source);
    }
  });
  return Array.from(sources).sort();
};

export const IncomeFilters: React.FC<IncomeFiltersProps> = ({
  incomes,
  onSearchChange,
  searchTerm
}) => {
  const { filters, setIncomeFilters, resetFilters } = useUIStore();
  const { categories } = useCategories();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const sources = getUniqueSources(incomes);

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.income.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    setIncomeFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleSourceToggle = (source: string) => {
    const currentSources = filters.income.sources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];

    setIncomeFilters({ sources: newSources.length > 0 ? newSources : undefined });
  };

  const handleDateFromChange = (date: string) => {
    setIncomeFilters({ dateFrom: date ? new Date(date) : undefined });
  };

  const handleDateToChange = (date: string) => {
    setIncomeFilters({ dateTo: date ? new Date(date) : undefined });
  };

  const handleResetFilters = () => {
    resetFilters();
    onSearchChange('');
  };

  const hasActiveFilters =
    searchTerm ||
    (filters.income.categories && filters.income.categories.length > 0) ||
    (filters.income.sources && filters.income.sources.length > 0) ||
    filters.income.dateFrom ||
    filters.income.dateTo;

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
          placeholder="Buscar por descripción, categoría, fuente..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white text-gray-900 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Quick Date Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            setIncomeFilters({ dateFrom: today, dateTo: endOfDay });
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
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            setIncomeFilters({ dateFrom: startOfWeek, dateTo: endOfDay });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Esta Semana
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            setIncomeFilters({ dateFrom: startOfMonth, dateTo: endOfDay });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Este Mes
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            startOfYear.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            setIncomeFilters({ dateFrom: startOfYear, dateTo: endOfDay });
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        >
          Este Año
        </button>
      </div>

      {/* Toggle Advanced Filters */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-primary-dark hover:text-primary-DEFAULT dark:text-primary-DEFAULT dark:hover:text-primary-light mb-4 flex items-center"
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
                value={filters.income.dateFrom ? formatDateForInput(filters.income.dateFrom) : ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.income.dateTo ? formatDateForInput(filters.income.dateTo) : ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Categories */}
          {incomeCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categorías
              </label>
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.income.categories?.includes(category.name)
                        ? 'bg-primary-dark text-white dark:bg-primary-DEFAULT'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuentes
              </label>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => handleSourceToggle(source)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.income.sources?.includes(source)
                        ? 'bg-primary-dark text-white dark:bg-primary-DEFAULT'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {source}
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
            {searchTerm && <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white px-2 py-1 rounded text-xs">Búsqueda: {searchTerm}</span>}
            {filters.income.categories && filters.income.categories.length > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white px-2 py-1 rounded text-xs">
                {filters.income.categories.length} categoría{filters.income.categories.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.income.sources && filters.income.sources.length > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white px-2 py-1 rounded text-xs">
                {filters.income.sources.length} fuente{filters.income.sources.length > 1 ? 's' : ''}
              </span>
            )}
            {(filters.income.dateFrom || filters.income.dateTo) && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white px-2 py-1 rounded text-xs">Rango de fechas</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
