
import React, { useState, useMemo } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseReports } from './ExpenseReports';
import { ExpenseCalendar } from './ExpenseCalendar';
import { useExpenses } from '../../hooks/useExpenses';
import { useUIStore } from '../../stores/useUIStore';
import { filterExpenses, sortExpenses } from '../../utils/filters';
import { Expense } from '../../types';

export const Expenses: React.FC = () => {
  const { expenses, addExpense, deleteExpense, updateExpense } = useExpenses();
  const { filters } = useUIStore();
  const [isExpenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'reports' | 'calendar'>('list');
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[] | null>(null);

  // Apply filters and search
  const filteredExpenses = useMemo(() => {
    const filtered = filterExpenses(expenses, {
      searchTerm,
      categories: filters.expenses.categories,
      paymentMethods: filters.expenses.paymentMethods,
      startDate: filters.expenses.dateFrom,
      endDate: filters.expenses.dateTo,
      minAmount: filters.expenses.minAmount,
      maxAmount: filters.expenses.maxAmount,
      tags: filters.expenses.tags,
    });

    // Sort by date (newest first)
    return sortExpenses(filtered, 'date', 'desc');
  }, [expenses, filters.expenses, searchTerm]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleCloseForm = () => {
    setExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expense);
    } else {
      addExpense(expense);
    }
    handleCloseForm();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gastos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredExpenses.length} de {expenses.length} gasto{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setExpenseFormOpen(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-dark hover:bg-primary-DEFAULT dark:bg-primary-DEFAULT dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
        >
          Agregar Gasto
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-primary-dark text-primary-dark dark:border-primary-light dark:text-primary-light'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'calendar'
                ? 'border-primary-dark text-primary-dark dark:border-primary-light dark:text-primary-light'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-dark text-primary-dark dark:border-primary-light dark:text-primary-light'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Reportes
          </button>
        </nav>
      </div>

      {activeTab === 'list' && (
        <>
          <ExpenseFilters
            expenses={expenses}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />

          <ExpenseList
            expenses={filteredExpenses}
            onDeleteExpense={deleteExpense}
            onEditExpense={handleEditExpense}
          />
        </>
      )}

      {activeTab === 'calendar' && (
        <>
          <ExpenseCalendar
            expenses={expenses}
            onDayClick={(_date, dayExpenses) => setSelectedDayExpenses(dayExpenses)}
          />

          {/* Show expenses for selected day */}
          {selectedDayExpenses && selectedDayExpenses.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gastos del día seleccionado ({selectedDayExpenses.length})
                </h3>
                <button
                  onClick={() => setSelectedDayExpenses(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Cerrar
                </button>
              </div>
              <ExpenseList
                expenses={selectedDayExpenses}
                onDeleteExpense={deleteExpense}
                onEditExpense={handleEditExpense}
              />
            </div>
          )}
        </>
      )}

      {activeTab === 'reports' && (
        <ExpenseReports expenses={filteredExpenses} />
      )}

      {isExpenseFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingExpense ? 'Editar Gasto' : 'Agregar Gasto'}
            </h3>
            <ExpenseForm
              expense={editingExpense || undefined}
              onAddExpense={handleSaveExpense}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};
