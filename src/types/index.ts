// Core Data Models for Financial Tracker

export interface Income {
  id: string;
  date: Date;
  amount: number;
  category: string; // e.g., Salary, Freelance, Gift, Investment Income
  description: string;
  source: string; // e.g., Employer, Client, Bank
  recurring?: boolean;
  attachments?: string[]; // e.g., pay stubs
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod: string;
  tags?: string[];
  recurring?: boolean;
  attachments?: string[]; // base64 images of receipts
}

export interface Investment {
  id: string;
  platform: 'Nu' | 'Didi' | 'MercadoPago' | 'Other';
  type: string; // 'Cajita', 'Inversión', etc.
  initialCapital: number;
  startDate: Date;
  gatPercentage: number; // Annual GAT%
  dailyReturn: number; // Calculated
  accumulatedReturns: number;
  currentValue: number;
  lastUpdate: Date;
  autoReinvest: boolean;
}

export interface BankAccount {
  id: string;
  bank: string;
  accountType: 'checking' | 'savings' | 'investment' | 'credit card';
  accountNumber: string; // Last 4 digits only
  balance: number;
  currency: 'MXN' | 'USD';
  lastUpdate: Date;
  isActive: boolean;
}

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
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  subcategories?: string[];
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
  accounts: BankAccount[];
  creditCards: CreditCard[];
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
  | { type: 'ADD_ACCOUNT'; payload: BankAccount }
  | { type: 'UPDATE_ACCOUNT'; payload: BankAccount }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_ACCOUNTS'; payload: BankAccount[] }

  // Credit Card Actions
  | { type: 'ADD_CREDIT_CARD'; payload: CreditCard }
  | { type: 'UPDATE_CREDIT_CARD'; payload: CreditCard }
  | { type: 'DELETE_CREDIT_CARD'; payload: string }
  | { type: 'SET_CREDIT_CARDS'; payload: CreditCard[] }

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
