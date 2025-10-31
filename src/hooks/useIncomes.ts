import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Income } from '../types';

export function useIncomes() {
  const incomes = useLiveQuery(() => db.incomes.toArray(), []);

  const addIncome = async (income: Omit<Income, 'id'>) => {
    const newId = crypto.randomUUID();
    const newIncome: Income = { ...income, id: newId };
    await db.incomes.add(newIncome);
    return newId;
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    await db.incomes.update(id, updates);
  };

  const deleteIncome = async (id: string) => {
    await db.incomes.delete(id);
  };

  const getIncomeById = (id: string) => {
    return db.incomes.get(id);
  };

  return { 
    incomes: incomes || [], 
    addIncome, 
    updateIncome, 
    deleteIncome, 
    getIncomeById 
  };
}