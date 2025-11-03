
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
  { name: 'Comida', type: 'expense', icon: '🍔' },
  { name: 'Transporte', type: 'expense', icon: '🚗' },
  { name: 'Vivienda', type: 'expense', icon: '🏠' },
  { name: 'Facturas y Servicios', type: 'expense', icon: '💡' },
  { name: 'Entretenimiento', type: 'expense', icon: '🎬' },
  { name: 'Salud y Bienestar', type: 'expense', icon: '❤️' },
  { name: 'Compras', type: 'expense', icon: '🛍️' },
  { name: 'Educación', type: 'expense', icon: '📚' },
  { name: 'Viajes', type: 'expense', icon: '✈️' },
  { name: 'Otros', type: 'expense', icon: '🤷' },

  // Income
  { name: 'Salario', type: 'income', icon: '💰' },
  { name: 'Freelance', type: 'income', icon: '💼' },
  { name: 'Inversiones', type: 'income', icon: '📈' },
  { name: 'Regalos', type: 'income', icon: '🎁' },
  { name: 'Otros', type: 'income', icon: '🤷' },
];
