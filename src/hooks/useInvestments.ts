
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Investment } from '../types';

export function useInvestments() {
  const investments = useLiveQuery(() => db.investments.toArray(), []);

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    const newId = crypto.randomUUID();
    const newInvestment: Investment = { ...investment, id: newId };
    await db.investments.add(newInvestment);
    return newId;
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    await db.investments.update(id, updates);
  };

  const deleteInvestment = async (id: string) => {
    await db.investments.delete(id);
  };

  const getInvestmentById = (id: string) => {
    return db.investments.get(id);
  };

  return { 
    investments: investments || [], 
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    getInvestmentById 
  };
}
