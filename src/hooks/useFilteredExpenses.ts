
import { useMemo } from 'react';
import { useExpenseStore } from '../stores/useExpenseStore';
import { useUIStore } from '../stores/useUIStore';
import { Expense } from '../types';

export const useFilteredExpenses = () => {
  const { expenses } = useExpenseStore();
  const { filters } = useUIStore();

  const filteredExpenses = useMemo(() => {
    let result: Expense[] = expenses;

    const {
      dateFrom,
      dateTo,
      categories,
      paymentMethods,
      minAmount,
      maxAmount,
    } = filters.expenses;

    if (dateFrom) {
      result = result.filter(e => new Date(e.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter(e => new Date(e.date) <= new Date(dateTo));
    }
    if (categories && categories.length > 0) {
      result = result.filter(e => categories.includes(e.category));
    }
    if (paymentMethods && paymentMethods.length > 0) {
      result = result.filter(e => paymentMethods.includes(e.paymentMethod));
    }
    if (minAmount) {
      result = result.filter(e => e.amount >= minAmount);
    }
    if (maxAmount) {
      result = result.filter(e => e.amount <= maxAmount);
    }

    return result;
  }, [expenses, filters.expenses]);

  return { filteredExpenses };
};
