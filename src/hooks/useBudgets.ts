
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Budget } from '../types';

export function useBudgets() {
  const budgets = useLiveQuery(() => db.budgets.toArray(), []);

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    const newId = crypto.randomUUID();
    const newBudget: Budget = { ...budget, id: newId };
    await db.budgets.add(newBudget);
    return newId;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    await db.budgets.update(id, updates);
  };

  const deleteBudget = async (id: string) => {
    await db.budgets.delete(id);
  };

  const getBudgetById = (id: string) => {
    return db.budgets.get(id);
  };

  return { 
    budgets: budgets || [], 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    getBudgetById 
  };
}
