
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { BankAccount } from '../types';

export function useAccounts() {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);

  const addAccount = async (account: Omit<BankAccount, 'id'>) => {
    const newId = crypto.randomUUID();
    const newAccount: BankAccount = { ...account, id: newId };
    await db.accounts.add(newAccount);
    return newId;
  };

  const updateAccount = async (id: string, updates: Partial<BankAccount>) => {
    await db.accounts.update(id, updates);
  };

  const deleteAccount = async (id: string) => {
    await db.accounts.delete(id);
  };

  const getAccountById = (id: string) => {
    return db.accounts.get(id);
  };

  return { 
    accounts: accounts || [], 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    getAccountById 
  };
}
