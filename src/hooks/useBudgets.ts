import { useLiveQuery } from 'dexie-react-hooks';
import { useBudgetStore } from '../stores/useBudgetStore';
import { db } from '../data/db';
import { useCallback } from 'react';

export const useBudgets = () => {
  const budgets = useLiveQuery(() => db.budgets.toArray(), []);
  const { addBudget, updateBudget, deleteBudget } = useBudgetStore();

  const getBudgetByCategoryAndPeriod = useCallback((categoryId: string, period: string) => {
    return budgets?.find(
      (b) => b.category === categoryId && b.period === period
    );
  }, [budgets]);

  return {
    budgets: budgets || [],
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategoryAndPeriod,
    isLoading: budgets === undefined,
  };
};