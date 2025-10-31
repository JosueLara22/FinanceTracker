import Dexie, { Table } from 'dexie';
import { 
  Expense, 
  Investment, 
  BankAccount, 
  CreditCard, 
  Budget, 
  SavingsGoal,
  Category,
  UserSettings
} from '../types';

export class FinancialDatabase extends Dexie {
  expenses!: Table<Expense, string>;
  investments!: Table<Investment, string>;
  accounts!: Table<BankAccount, string>;
  creditCards!: Table<CreditCard, string>;
  budgets!: Table<Budget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  categories!: Table<Category, string>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super('FinancialTrackerDB');
    this.version(1).stores({
      expenses: 'id, date, category, paymentMethod',
      investments: 'id, platform, type',
      accounts: 'id, bank, accountType',
      creditCards: 'id, bank, cardName',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });
  }
}

export const db = new FinancialDatabase();