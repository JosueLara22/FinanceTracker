
import React, { createContext, useContext, ReactNode } from 'react';
import { db } from '../data/db';
import { Expense } from '../types';

interface AppContextType {
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  // Other db actions will be added here
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await db.expenses.add(expense as Expense); // Dexie handles the ID
  };

  return (
    <AppContext.Provider value={{ addExpense }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
