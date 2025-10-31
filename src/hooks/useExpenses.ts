
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Expense } from '../types';

export function useExpenses() {
  const expenses = useLiveQuery(() => db.expenses.toArray(), []);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newId = crypto.randomUUID();
    const newExpense: Expense = { ...expense, id: newId };
    await db.expenses.add(newExpense);
    return newId;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    await db.expenses.update(id, updates);
  };

  const deleteExpense = async (id: string) => {
    await db.expenses.delete(id);
  };

  const getExpenseById = (id: string) => {
    return db.expenses.get(id);
  };

  return { 
    expenses: expenses || [], 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    getExpenseById 
  };
}
