// Core Data Models for Financial Tracker

export interface Income {
  id: string;
  date: Date;
  amount: number;
  category: string; // e.g., Salary, Freelance, Gift, Investment Income
  description: string;
  source: string; // e.g., Employer, Client, Bank
  recurring?: boolean;
  accountId?: string; // FK to Account (where deposited)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod: 'cash' | 'debit' | 'credit' | 'transfer' | 'other';
  accountId?: string; // FK to Account or CreditCard
  tags?: string[];
  recurring?: boolean;
  attachments?: string[]; // base64 images of receipts
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Investment {
  id: string;
  platform: 'Nu' | 'Didi' | 'MercadoPago' | 'Other';
  type: string; // 'Cajita', 'Inversión', etc.
  initialCapital: number;
  startDate: Date;
  gatPercentage: number; // Annual GAT%
  dailyReturn: number; // Calculated daily (will be computed dynamically)
  accumulatedReturns: number;
  currentValue: number;
  lastUpdate: Date;
  autoReinvest: boolean;
  sourceAccountId?: string; // NEW - FK to BankAccount.id (where initial capital came from)
  contributions?: InvestmentContribution[]; // List of additional contributions
  withdrawals?: InvestmentWithdrawal[]; // List of withdrawals
}

// Investment Contribution (adding money to investment)
export interface InvestmentContribution {
  id: string;
  investmentId: string;
  date: Date;
  amount: number;
  source?: string; // Optional text description
  sourceAccountId?: string; // NEW - FK to BankAccount.id (where contribution came from)
  createdAt: Date;
}

// Investment Withdrawal (taking money out of investment)
export interface InvestmentWithdrawal {
  id: string;
  investmentId: string;
  date: Date;
  amount: number;
  reason?: string; // Optional text description
  destinationAccountId?: string; // FK to BankAccount.id (where money goes)
  createdAt: Date;
}

// Snapshot of investment value at a specific point in time
export interface InvestmentSnapshot {
  id: string;
  investmentId: string;
  date: Date;
  value: number; // Total value at this date
  accumulatedReturns: number; // Total returns up to this date
  dailyReturn: number; // Return earned on this specific day
  createdAt: Date;
}

export interface Account {
  id: string;
  name: string; // e.g., "My Wallet", "BBVA Debit"
  type: 'bank' | 'cash'; // The new discriminator
  balance: number;
  currency: 'MXN' | 'USD';
  isActive: boolean;
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;

  // Bank-specific fields (optional)
  bankName?: string;
  accountNumber?: string; // Last 4 digits
  accountType?: 'checking' | 'savings'; // Traditional account types

  // Robustness fields
  needsRecalculation?: boolean;
  hasDiscrepancy?: boolean;
  deletedAt?: Date;
}

// BankAccount is an alias for Account (for backward compatibility)
export type BankAccount = Account;

export interface CreditCard {
  id: string;
  bank: string;
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  cutoffDate: number; // Day of month
  paymentDate: number; // Day of month
  interestRate: number;
  lastUpdate?: Date;

  // Robustness fields
  needsRecalculation?: boolean;
  hasDiscrepancy?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transaction (for accounts and cards)
export interface Transaction {
  id: string;
  accountId: string; // FK to BankAccount or CreditCard
  accountType: 'bank' | 'credit';
  date: Date;
  amount: number; // Positive for credits, negative for debits
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'charge' | 'refund' | 'adjustment_increase' | 'adjustment_decrease';
  description: string;
  category?: string;
  balance: number; // Balance after this transaction
  relatedTransactionId?: string; // For transfers (links both sides)
  transferId?: string; // FK to Transfer.id
  expenseId?: string; // FK to Expense.id
  incomeId?: string; // FK to Income.id
  pending: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  reversedBy?: string; // ID of reversal transaction
  reverses?: string; // ID of original transaction being reversed
}

// Transfer (between accounts)
export interface Transfer {
  id: string;
  fromAccountId: string;
  fromAccountType: 'bank' | 'credit';
  toAccountId: string;
  toAccountType: 'bank' | 'credit';
  amount: number;
  fromCurrency: 'MXN' | 'USD';
  toCurrency: 'MXN' | 'USD';
  exchangeRate?: number; // If currency conversion
  fee?: number;
  date: Date;
  description: string;
  fromTransactionId: string; // FK to Transaction.id
  toTransactionId: string; // FK to Transaction.id
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  period: string; // 'YYYY-MM'
  spent: number; // Calculated from expenses
  alertThreshold: number; // Percentage (e.g., 80)
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  autoContribution?: number; // Monthly auto-save amount
  linkedAccount?: string; // Account ID
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon?: string;
  color?: string;
  subcategories?: string[];
  isDefault?: boolean;
  order?: number;
  budgetEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSettings {
  id: string;
  name: string;
  currency: 'MXN' | 'USD';
  language: 'es' | 'en';
  dateFormat: string;
  enableNotifications: boolean;
  enableBiometricLock: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UIState {
  isLoading: boolean;
  activeView: string;
  selectedPeriod: string;
  filters: {
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    paymentMethods?: string[];
  };
}

// Global Application State
export interface AppState {
  user: UserSettings;
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  ui: UIState;
}

// Action Types for State Management
export type ActionType =
  // Expense Actions
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }

  // Income Actions
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'SET_INCOMES'; payload: Income[] }

  // Investment Actions
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'UPDATE_INVESTMENT'; payload: Investment }
  | { type: 'DELETE_INVESTMENT'; payload: string }
  | { type: 'SET_INVESTMENTS'; payload: Investment[] }

  // Bank Account Actions
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }

  // Credit Card Actions
  | { type: 'ADD_CREDIT_CARD'; payload: CreditCard }
  | { type: 'UPDATE_CREDIT_CARD'; payload: CreditCard }
  | { type: 'DELETE_CREDIT_CARD'; payload: string }
  | { type: 'SET_CREDIT_CARDS'; payload: CreditCard[] }

  // Transaction Actions
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }

  // Transfer Actions
  | { type: 'ADD_TRANSFER'; payload: Transfer }
  | { type: 'UPDATE_TRANSFER'; payload: Transfer }
  | { type: 'DELETE_TRANSFER'; payload: string }
  | { type: 'SET_TRANSFERS'; payload: Transfer[] }

  // Budget Actions
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }

  // Savings Goal Actions
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'SET_SAVINGS_GOALS'; payload: SavingsGoal[] }

  // Category Actions
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }

  // UI Actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_VIEW'; payload: string }
  | { type: 'SET_SELECTED_PERIOD'; payload: string }
  | { type: 'SET_FILTERS'; payload: UIState['filters'] }

  // User Settings Actions
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> };
