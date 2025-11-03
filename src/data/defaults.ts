
import { Category, UserSettings, BankAccount } from '../types';

export const initialUserSettings: UserSettings = {
  id: '1',
  name: 'Guest',
  currency: 'MXN',
  language: 'es',
  dateFormat: 'YYYY-MM-DD',
  enableNotifications: true,
  enableBiometricLock: false,
  theme: 'auto',
};

export const defaultAccounts: Omit<BankAccount, 'id'>[] = [
  {
    bank: 'Efectivo',
    accountType: 'checking',
    accountNumber: '0000',
    balance: 0,
    currency: 'MXN',
    lastUpdate: new Date(),
    isActive: true,
  },
];

export const defaultCategories: Omit<Category, 'id'>[] = [
  // Expenses
  { name: 'Food', type: 'expense', icon: '🍔' },
  { name: 'Transportation', type: 'expense', icon: '🚗' },
  { name: 'Housing', type: 'expense', icon: '🏠' },
  { name: 'Bills & Utilities', type: 'expense', icon: '💡' },
  { name: 'Entertainment', type: 'expense', icon: '🎬' },
  { name: 'Health & Wellness', type: 'expense', icon: '❤️' },
  { name: 'Shopping', type: 'expense', icon: '🛍️' },
  { name: 'Education', type: 'expense', icon: '📚' },
  { name: 'Travel', type: 'expense', icon: '✈️' },
  { name: 'Other', type: 'expense', icon: '🤷' },

  // Income
  { name: 'Salary', type: 'income', icon: '💰' },
  { name: 'Freelance', type: 'income', icon: '💼' },
  { name: 'Investments', type: 'income', icon: '📈' },
  { name: 'Gifts', type: 'income', icon: '🎁' },
  { name: 'Other', type: 'income', icon: '🤷' },
];
