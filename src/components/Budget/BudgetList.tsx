import React from 'react';
import { Budget, Expense, Category } from '../../types';
import { BudgetCard } from './BudgetCard';

interface BudgetListProps {
  budgets: Budget[];
  expenses: Expense[];
  categories: Category[];
  onEdit: (budget: Budget) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({ budgets, expenses, categories, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => (
        <BudgetCard key={budget.id} budget={budget} expenses={expenses} categories={categories} onEdit={onEdit} />
      ))}
    </div>
  );
};
