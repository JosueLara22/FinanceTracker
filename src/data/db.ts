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
  get expenses(): Table<Expense, string> { return this.table('expenses'); }
  get incomes(): Table<Income, string> { return this.table('incomes'); }
  get investments(): Table<Investment, string> { return this.table('investments'); }
  get investmentSnapshots(): Table<InvestmentSnapshot, string> { return this.table('investmentSnapshots'); }
  get investmentContributions(): Table<InvestmentContribution, string> { return this.table('investmentContributions'); }
  get investmentWithdrawals(): Table<InvestmentWithdrawal, string> { return this.table('investmentWithdrawals'); }
  get accounts(): Table<BankAccount, string> { return this.table('accounts'); }
  get creditCards(): Table<CreditCard, string> { return this.table('creditCards'); }
  get transactions(): Table<Transaction, string> { return this.table('transactions'); }
  get transfers(): Table<Transfer, string> { return this.table('transfers'); }
  get budgets(): Table<Budget, string> { return this.table('budgets'); }
  get savingsGoals(): Table<SavingsGoal, string> { return this.table('savingsGoals'); }
  get categories(): Table<Category, string> { return this.table('categories'); }
  get userSettings(): Table<UserSettings, string> { return this.table('userSettings'); }

  constructor() {
    super('FinancialTrackerDB');
    console.log('FinancialDatabase constructor called');

    // Version 1: Initial schema
    this.version(1).stores({
      expenses: 'id, date, category, paymentMethod, accountId, deletedAt',
      incomes: 'id, date, category, source, accountId, deletedAt',
      investments: 'id, platform, type',
      accounts: 'id, bank, accountType, deletedAt',
      creditCards: 'id, bank, cardName, deletedAt',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 2: Add investment snapshots
    this.version(2).stores({
      expenses: 'id, date, category, paymentMethod, accountId, deletedAt',
      incomes: 'id, date, category, source, accountId, deletedAt',
      investments: 'id, platform, type',
      investmentSnapshots: 'id, investmentId, date, [investmentId+date]',
      accounts: 'id, bank, accountType, deletedAt',
      creditCards: 'id, bank, cardName, deletedAt',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 3: Add sourceAccountId to investments, add contributions and withdrawals tables
    this.version(3).stores({
      expenses: 'id, date, category, paymentMethod, accountId, deletedAt',
      incomes: 'id, date, category, source, accountId, deletedAt',
      investments: 'id, platform, type, sourceAccountId', // Added sourceAccountId index
      investmentSnapshots: 'id, investmentId, date, [investmentId+date]',
      investmentContributions: 'id, investmentId, date, sourceAccountId', // NEW table
      investmentWithdrawals: 'id, investmentId, date, destinationAccountId', // NEW table
      accounts: 'id, bank, accountType, deletedAt',
      creditCards: 'id, bank, cardName, deletedAt',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 4: Add robustness fields (deletedAt, needsRecalculation, hasDiscrepancy, reversedBy, reverses)
    this.version(4).stores({
      expenses: 'id, date, category, paymentMethod, accountId, deletedAt',
      incomes: 'id, date, category, source, accountId, deletedAt',
      investments: 'id, platform, type, sourceAccountId',
      investmentSnapshots: 'id, investmentId, date, [investmentId+date]',
      investmentContributions: 'id, investmentId, date, sourceAccountId',
      investmentWithdrawals: 'id, investmentId, date, destinationAccountId',
      accounts: 'id, bank, accountType, deletedAt',
      creditCards: 'id, bank, cardName, deletedAt',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId, deletedAt, pending',
      transfers: 'id, fromAccountId, toAccountId, date, status, deletedAt',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    });

    // Version 5: Add deletedAt to investment-related tables and remove isActive
    this.version(5).stores({
      expenses: 'id, date, category, paymentMethod, accountId, deletedAt',
      incomes: 'id, date, category, source, accountId, deletedAt',
      investments: 'id, platform, type, sourceAccountId, deletedAt', // Add deletedAt, remove isActive from index
      investmentSnapshots: 'id, investmentId, date, [investmentId+date], deletedAt',
      investmentContributions: 'id, investmentId, date, sourceAccountId, deletedAt',
      investmentWithdrawals: 'id, investmentId, date, destinationAccountId, deletedAt',
      accounts: 'id, bank, accountType, deletedAt',
      creditCards: 'id, bank, cardName, deletedAt',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId, deletedAt, pending',
      transfers: 'id, fromAccountId, toAccountId, date, status, deletedAt',
      budgets: 'id, category, period',
      savingsGoals: 'id, name, priority',
      categories: 'id, name, type',
      userSettings: 'id',
    }).upgrade(async (trans) => {
      // Migration to remove 'isActive' from investments
      await trans.table('investments').toCollection().modify(inv => {
        if ('isActive' in inv) {
          delete inv.isActive;
        }
      });
    });
  }
}

export const db = new FinancialDatabase();

export const dbReady = db.open();