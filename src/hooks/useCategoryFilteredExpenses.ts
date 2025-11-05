import { useMemo } from 'react';
import { useExpenseStore } from '../stores/useExpenseStore';
import { useUIStore } from '../stores/useUIStore';
import { Expense } from '../types';

export const useCategoryFilteredExpenses = () => {
  const { expenses } = useExpenseStore();
  const { filters } = useUIStore();

  const filteredExpenses = useMemo(() => {
    let result: Expense[] = expenses;

    const { categories } = filters.expenses;

    if (categories && categories.length > 0) {
      result = result.filter(e => categories.includes(e.category));
    }

    return result;
  }, [expenses, filters.expenses.categories]);

  return { filteredExpenses };
};
