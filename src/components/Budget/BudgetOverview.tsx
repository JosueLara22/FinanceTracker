import React from 'react';
import { Budget, Expense, Category } from '../../types';
import { calculateBudgetUsage } from '../../utils/budgetCalculations';

interface BudgetOverviewProps {
  budgets: Budget[];
  expenses: Expense[];
  categories: Category[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets, expenses, categories }) => {
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const status = calculateBudgetUsage(b, expenses, categories);
    return sum + status.spent;
  }, 0);
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressBarColor = () => {
    if (totalPercentage < 70) return 'bg-green-500';
    if (totalPercentage < 90) return 'bg-yellow-500';
    if (totalPercentage <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Resumen Mensual de Presupuestos</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg text-gray-800 dark:text-gray-200">Total Gastado</span>
        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${getProgressBarColor()}`}
          style={{ width: `${Math.min(totalPercentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{totalPercentage.toFixed(0)}% del presupuesto usado</span>
        <span>Restante: ${totalRemaining.toFixed(2)}</span>
      </div>
    </div>
  );
};
