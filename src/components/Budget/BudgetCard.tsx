import React from 'react';
import { Budget, Expense, Category } from '../../types';
import { calculateBudgetUsage } from '../../utils/budgetCalculations';
import { useCategories } from '../../hooks/useCategories';
import { useBudgets } from '../../hooks/useBudgets';

interface BudgetCardProps {
  budget: Budget;
  expenses: Expense[];
  categories: Category[];
  onEdit: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, expenses, categories, onEdit }) => {
  const { getCategoryById } = useCategories();
  const { deleteBudget } = useBudgets();
  const budgetStatus = calculateBudgetUsage(budget, expenses, categories);
  const category = getCategoryById(budget.category);

  const getProgressBarColor = () => {
    switch (budgetStatus.status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-orange-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(budget.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{category?.name}</h3>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{budgetStatus.percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${getProgressBarColor()}`}
          style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Gastado: ${budgetStatus.spent.toFixed(2)}</span>
        <span>Restante: ${budgetStatus.remaining.toFixed(2)}</span>
      </div>
      <div className="text-center mt-1 text-sm text-gray-500 dark:text-gray-400">
        Límite: ${budgetStatus.limit.toFixed(2)}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={() => onEdit(budget)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
