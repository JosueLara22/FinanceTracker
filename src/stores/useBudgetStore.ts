import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Budget } from '../types';
import { db } from '../data/db';
import { v4 as uuidv4 } from 'uuid';

interface BudgetState {
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'spent'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()(
  devtools(
    () => ({
      addBudget: async (budgetData) => {
        const newBudget: Budget = {
          ...budgetData,
          id: uuidv4(),
          spent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.budgets.add(newBudget);
      },
      updateBudget: async (budget) => {
        const updatedBudget = { ...budget, updatedAt: new Date() };
        await db.budgets.update(budget.id, updatedBudget);
      },
      deleteBudget: async (id) => {
        await db.budgets.delete(id);
      },
    }),
    { name: 'BudgetStore' }
  )
);
