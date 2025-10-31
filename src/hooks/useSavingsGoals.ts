
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { SavingsGoal } from '../types';

export function useSavingsGoals() {
  const savingsGoals = useLiveQuery(() => db.savingsGoals.toArray(), []);

  const addSavingsGoal = async (savingsGoal: Omit<SavingsGoal, 'id'>) => {
    const newId = crypto.randomUUID();
    const newSavingsGoal: SavingsGoal = { ...savingsGoal, id: newId };
    await db.savingsGoals.add(newSavingsGoal);
    return newId;
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    await db.savingsGoals.update(id, updates);
  };

  const deleteSavingsGoal = async (id: string) => {
    await db.savingsGoals.delete(id);
  };

  const getSavingsGoalById = (id: string) => {
    return db.savingsGoals.get(id);
  };

  return { 
    savingsGoals: savingsGoals || [], 
    addSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal, 
    getSavingsGoalById 
  };
}
