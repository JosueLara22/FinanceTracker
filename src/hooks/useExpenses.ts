
import { useExpenseStore } from '../stores/useExpenseStore';
import { Expense } from '../types';

export function useExpenses() {
  const {
    expenses,
    addExpense: storeAddExpense,
    updateExpense: storeUpdateExpense,
    deleteExpense: storeDeleteExpense,
    getExpenseById
  } = useExpenseStore();

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await storeAddExpense(expense);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    await storeUpdateExpense(id, updates);
  };

  const deleteExpense = async (id: string) => {
    await storeDeleteExpense(id);
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById
  };
}
