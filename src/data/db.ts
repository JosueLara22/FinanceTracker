import Dexie, { Table } from 'dexie';
import {
  Expense,
  Income,
  Investment,
  InvestmentSnapshot,
  InvestmentContribution,
  InvestmentWithdrawal,
  BankAccount,
  CreditCard,
  Transaction,
  Transfer,
  Budget,
  SavingsGoal,
  Category,
  UserSettings
} from '../types';

export class FinancialDatabase extends Dexie {
  expenses!: Table<Expense, string>;
  incomes!: Table<Income, string>;
  investments!: Table<Investment, string>;
  investmentSnapshots!: Table<InvestmentSnapshot, string>;
  investmentContributions!: Table<InvestmentContribution, string>;
  investmentWithdrawals!: Table<InvestmentWithdrawal, string>;
  accounts!: Table<BankAccount, string>;
  creditCards!: Table<CreditCard, string>;
  transactions!: Table<Transaction, string>;
  transfers!: Table<Transfer, string>;
  budgets!: Table<Budget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  categories!: Table<Category, string>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super('FinancialTrackerDB');
    this.version(1).stores({
      expenses: 'id, date, category, paymentMethod, accountId',
      incomes: 'id, date, category, source, accountId',
      investments: 'id, platform, type',
      accounts: 'id, bank, accountType',
      creditCards: 'id, bank, cardName',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 2: Add investment snapshots
    this.version(2).stores({
      expenses: 'id, date, category, paymentMethod, accountId',
      incomes: 'id, date, category, source, accountId',
      investments: 'id, platform, type',
      investmentSnapshots: 'id, investmentId, date, [investmentId+date]',
      accounts: 'id, bank, accountType',
      creditCards: 'id, bank, cardName',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 3: Add sourceAccountId to investments, add contributions and withdrawals tables
    this.version(3).stores({
      expenses: 'id, date, category, paymentMethod, accountId',
      incomes: 'id, date, category, source, accountId',
      investments: 'id, platform, type, sourceAccountId', // Added sourceAccountId index
      investmentSnapshots: 'id, investmentId, date, [investmentId+date]',
      investmentContributions: 'id, investmentId, date, sourceAccountId', // NEW table
      investmentWithdrawals: 'id, investmentId, date, destinationAccountId', // NEW table
      accounts: 'id, bank, accountType',
      creditCards: 'id, bank, cardName',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });
  }
}

export const db = new FinancialDatabase();