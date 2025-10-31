import Dexie, { Table } from 'dexie';
import {
  Expense,
  Investment,
  BankAccount,
  CreditCard,
  Budget,
  SavingsGoal,
  Category,
  UserSettings,
} from '../types';

export class FinancialTrackerDB extends Dexie {
  expenses!: Table<Expense>;
  investments!: Table<Investment>;
  accounts!: Table<BankAccount>;
  creditCards!: Table<CreditCard>;
  budgets!: Table<Budget>;
  savingsGoals!: Table<SavingsGoal>;
  categories!: Table<Category>;
  userSettings!: Table<UserSettings>;

  constructor() {
    super('FinancialTrackerDB');
    this.version(1).stores({
      expenses: '++id, date, category, paymentMethod',
      investments: '++id, platform, type',
      accounts: '++id, bank, accountType',
      creditCards: '++id, bank, cardName',
      budgets: '++id, category, period',
      savingsGoals: '++id, name, targetDate',
      categories: '++id, name, type',
      userSettings: 'id',
    });
  }
}

export const db = new FinancialTrackerDB();
