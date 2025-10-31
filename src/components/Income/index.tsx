import React, { useState, useMemo } from 'react';
import { IncomeList } from './IncomeList';
import { IncomeForm } from './IncomeForm';
import { IncomeFilters } from './IncomeFilters';
import { IncomeReports } from './IncomeReports';
import { useIncomes } from '../../hooks/useIncomes';
import { useUIStore } from '../../stores/useUIStore';
import { Income as IncomeType } from '../../types';

export const Income: React.FC = () => {
  const { incomes, addIncome, updateIncome, deleteIncome } = useIncomes();
  const [isIncomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'reports'>('list');
  const { filters } = useUIStore();

  // Apply filters to incomes
  const filteredIncomes = useMemo(() => {
    let result = incomes || [];

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (income) =>
          income.description.toLowerCase().includes(lowerSearch) ||
          income.category.toLowerCase().includes(lowerSearch) ||
          income.source.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply category filter
    if (filters.income.categories && filters.income.categories.length > 0) {
      result = result.filter((income) =>
        filters.income.categories!.includes(income.category)
      );
    }

    // Apply source filter
    if (filters.income.sources && filters.income.sources.length > 0) {
      result = result.filter((income) =>
        filters.income.sources!.includes(income.source)
      );
    }

    // Apply date range filter
    if (filters.income.dateFrom) {
      result = result.filter(
        (income) => new Date(income.date) >= filters.income.dateFrom!
      );
    }

    if (filters.income.dateTo) {
      const endOfDay = new Date(filters.income.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(
        (income) => new Date(income.date) <= endOfDay
      );
    }

    return result;
  }, [incomes, searchTerm, filters.income]);

  const handleEdit = (income: IncomeType) => {
    setEditingIncome(income);
    setIncomeFormOpen(true);
  };

  const handleCloseForm = () => {
    setIncomeFormOpen(false);
    setEditingIncome(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ingresos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredIncomes.length} de {incomes?.length || 0} ingreso{(incomes?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIncomeFormOpen(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
        >
          Agregar Ingreso
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-primary-DEFAULT text-primary-DEFAULT dark:text-primary-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-DEFAULT text-primary-DEFAULT dark:text-primary-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Reportes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          <IncomeFilters
            incomes={incomes || []}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <IncomeList
            incomes={filteredIncomes}
            onDeleteIncome={deleteIncome}
            onEditIncome={handleEdit}
          />
        </>
      )}

      {activeTab === 'reports' && (
        <IncomeReports incomes={incomes || []} />
      )}

      {isIncomeFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h3>
            <IncomeForm
              income={editingIncome || undefined}
              onAddIncome={(income) => {
                if (editingIncome) {
                  updateIncome(editingIncome.id, income);
                } else {
                  addIncome(income);
                }
                handleCloseForm();
              }}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};