import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { BudgetOverview } from './BudgetOverview';
import { BudgetList } from './BudgetList';
import { BudgetForm } from './BudgetForm';
import Modal from '../common/Modal';
import { Budget } from '../../types';

export const BudgetPlanner: React.FC = () => {
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { expenses } = useExpenses();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  if (budgetsLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingBudget(undefined);
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Planificador de Presupuestos</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded"
        >
          Añadir Presupuesto
        </button>
      </div>

      <BudgetOverview budgets={budgets} expenses={expenses} categories={categories} />
      <BudgetList budgets={budgets} expenses={expenses} categories={categories} onEdit={handleEditBudget} />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
      >
        <BudgetForm onClose={handleCloseForm} budget={editingBudget} />
      </Modal>
    </div>
  );
};
