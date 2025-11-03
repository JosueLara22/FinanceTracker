import { useIncomeStore } from '../stores/useIncomeStore';
import { Income } from '../types';

export function useIncomes() {
  const {
    incomes,
    addIncome: storeAddIncome,
    updateIncome: storeUpdateIncome,
    deleteIncome: storeDeleteIncome,
    getIncomeById
  } = useIncomeStore();

  const addIncome = async (income: Omit<Income, 'id'>) => {
    await storeAddIncome(income);
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    await storeUpdateIncome(id, updates);
  };

  const deleteIncome = async (id: string) => {
    await storeDeleteIncome(id);
  };

  return {
    incomes,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncomeById
  };
}