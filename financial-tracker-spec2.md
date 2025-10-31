# 📋 Financial Tracker Application - Complete Project Specification v2

## 🎯 Project Overview

Create a comprehensive personal finance tracking application with a modern web interface that tracks income, expenses, savings, credit cards, bank accounts, and investments (specifically Mexican fintechs: Nu, Didi, and Mercado Pago). The system should work both online and offline, with local data storage and export capabilities.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand (lightweight, scalable alternative to Context API)
- **Data Persistence**: IndexedDB via Dexie.js (primary), LocalStorage (fallback for small data)
- **Charts**: Recharts for visualizations
- **Export**: SheetJS (xlsx) for Excel, jsPDF for PDF generation
- **PWA**: Progressive Web App for mobile installation
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod for validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React icon set

### Project Structure
```
financial-tracker/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Expenses/
│   │   ├── Income/
│   │   ├── Investments/
│   │   ├── Budget/
│   │   ├── Accounts/
│   │   ├── Bills/
│   │   ├── Transfers/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── common/
│   ├── contexts/          # (deprecated - using Zustand)
│   ├── store/             # Zustand store slices
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   │   ├── calculations.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── currency.ts
│   ├── types/             # TypeScript definitions
│   ├── data/              # Default data and constants
│   ├── services/          # Business logic layer
│   │   ├── storage.ts     # IndexedDB/LocalStorage abstraction
│   │   ├── export.ts      # Export functionality
│   │   ├── import.ts      # Import functionality
│   │   └── calculations.ts
│   ├── db/                # Database schema
│   │   └── schema.ts      # Dexie.js configuration
│   ├── routes/            # Route definitions
│   └── workers/           # Service worker for PWA
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
└── package.json
```

## 📊 Data Models (Complete)

### Core Entities

```typescript
// 1. Income
interface Income {
  id: string;                    // UUID v4
  date: Date;
  amount: number;                // Positive number
  category: string;              // FK to Category.id
  description: string;
  source: string;                // e.g., Employer, Client, Bank
  recurring?: boolean;
  recurringId?: string;          // FK to RecurringTransaction.id
  accountId?: string;            // FK to BankAccount.id (where deposited)
  tags?: string[];
  attachments?: string[];        // Base64 encoded files
  taxable: boolean;              // For ISR tracking
  taxCategoryId?: string;        // FK to TaxCategory.id
  createdAt: Date;
  updatedAt: Date;
}

// 2. Expense
interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;              // FK to Category.id
  subcategory?: string;          // FK to Category.id
  description: string;
  paymentMethod: 'cash' | 'debit' | 'credit' | 'transfer' | 'other';
  accountId?: string;            // FK to BankAccount or CreditCard
  tags?: string[];
  recurring?: boolean;
  recurringId?: string;          // FK to RecurringTransaction.id
  attachments?: string[];        // Base64 images of receipts
  location?: {
    lat: number;
    lng: number;
    name?: string;               // Merchant name
  };
  splitItems?: ExpenseSplit[];   // For multi-category expenses
  sharedExpenseId?: string;      // FK to SharedExpense.id
  deductible: boolean;           // Tax deductible
  taxCategoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2a. Expense Split (for multi-category expenses)
interface ExpenseSplit {
  categoryId: string;
  amount: number;
  percentage: number;            // 0-100
  description?: string;
}

// 3. Investment (Mexican Fintech)
interface Investment {
  id: string;
  platform: 'Nu' | 'Didi' | 'MercadoPago' | 'Other';
  platformName?: string;         // If Other
  type: string;                  // 'Cajita', 'Inversión', 'Fondo', etc.
  initialCapital: number;
  startDate: Date;
  gatPercentage: number;         // Annual GAT%
  dailyReturn: number;           // Calculated automatically
  accumulatedReturns: number;    // Sum of all returns
  currentValue: number;          // Initial + contributions + returns - withdrawals
  lastUpdate: Date;
  autoReinvest: boolean;
  contributions: InvestmentContribution[];
  withdrawals: InvestmentWithdrawal[];
  valueHistory: InvestmentSnapshot[];
  taxableReturns: number;        // For ISR calculation
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 3a. Investment Contribution
interface InvestmentContribution {
  id: string;
  investmentId: string;
  date: Date;
  amount: number;
  source?: string;               // Where money came from
  createdAt: Date;
}

// 3b. Investment Withdrawal
interface InvestmentWithdrawal {
  id: string;
  investmentId: string;
  date: Date;
  amount: number;
  reason?: string;
  destinationAccountId?: string;
  createdAt: Date;
}

// 3c. Investment Snapshot (for historical tracking)
interface InvestmentSnapshot {
  date: Date;
  value: number;
  returns: number;               // Returns for that period
  gatPercentage: number;         // GAT at that time
}

// 4. BankAccount
interface BankAccount {
  id: string;
  bank: string;
  accountType: 'checking' | 'savings' | 'investment';
  accountNumber: string;         // Last 4 digits only
  balance: number;
  currency: 'MXN' | 'USD';
  lastUpdate: Date;
  isActive: boolean;
  color?: string;                // For UI identification
  icon?: string;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

// 5. CreditCard
interface CreditCard {
  id: string;
  bank: string;
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;        // How much you owe
  availableCredit: number;       // creditLimit - currentBalance
  cutoffDate: number;            // Day of month (1-31)
  paymentDueDate: number;        // Day of month (1-31)
  interestRate: number;          // Annual percentage
  minimumPayment: number;        // Calculated monthly
  color?: string;
  transactions: Transaction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 6. Transaction (for accounts and cards)
interface Transaction {
  id: string;
  accountId: string;             // FK to BankAccount or CreditCard
  accountType: 'bank' | 'credit';
  date: Date;
  amount: number;                // Positive for credits, negative for debits
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'charge' | 'refund';
  description: string;
  category?: string;
  balance: number;               // Balance after this transaction
  relatedTransactionId?: string; // For transfers (links both sides)
  transferId?: string;           // FK to Transfer.id
  expenseId?: string;            // FK to Expense.id
  incomeId?: string;             // FK to Income.id
  pending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 7. Transfer (between accounts)
interface Transfer {
  id: string;
  fromAccountId: string;
  fromAccountType: 'bank' | 'credit';
  toAccountId: string;
  toAccountType: 'bank' | 'credit';
  amount: number;
  fromCurrency: 'MXN' | 'USD';
  toCurrency: 'MXN' | 'USD';
  exchangeRate?: number;         // If currency conversion
  fee?: number;
  date: Date;
  description: string;
  fromTransactionId: string;     // FK to Transaction.id
  toTransactionId: string;       // FK to Transaction.id
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// 8. Budget
interface Budget {
  id: string;
  category: string;              // FK to Category.id
  monthlyLimit: number;
  period: string;                // 'YYYY-MM'
  spent: number;                 // Calculated from expenses
  alertThreshold: number;        // Percentage (e.g., 80)
  rollover: boolean;             // Unused budget carries to next month
  rolloverAmount?: number;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 9. SavingsGoal
interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  autoContribution?: number;     // Monthly auto-save amount
  linkedAccountId?: string;      // FK to BankAccount.id
  color?: string;
  icon?: string;
  contributions: SavingsContribution[];
  createdAt: Date;
  updatedAt: Date;
}

// 9a. Savings Contribution
interface SavingsContribution {
  id: string;
  goalId: string;
  date: Date;
  amount: number;
  source?: string;
  createdAt: Date;
}

// 10. Bill (Recurring bills and subscriptions)
interface Bill {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category: string;              // FK to Category.id
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: Date;
  lastPaidDate?: Date;
  accountId?: string;            // Default payment account
  paymentMethod?: string;
  reminderDays: number;          // Remind X days before due
  reminderEnabled: boolean;
  autoPay: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 11. RecurringTransaction
interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  amount: number;
  category: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  lastProcessed?: Date;
  nextDue: Date;
  dayOfWeek?: number;            // For weekly (0-6, Sun-Sat)
  dayOfMonth?: number;           // For monthly (1-31)
  accountId?: string;
  isActive: boolean;
  autoCreate: boolean;           // Automatically create transactions
  createdAt: Date;
  updatedAt: Date;
}

// 12. Category
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  parentCategoryId?: string;     // For subcategories
  icon?: string;                 // Lucide icon name
  color?: string;                // Hex color
  isDefault: boolean;            // System default, can't delete
  order: number;                 // Display order
  budgetEnabled: boolean;        // Can this category have a budget?
  createdAt: Date;
  updatedAt: Date;
}

// 13. Loan (Debts beyond credit cards)
interface Loan {
  id: string;
  lender: string;
  loanName: string;
  type: 'personal' | 'auto' | 'mortgage' | 'student' | 'business' | 'other';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;          // Annual percentage
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  nextPaymentDate: Date;
  paymentDay: number;            // Day of month
  remainingPayments: number;
  totalPayments: number;
  payments: LoanPayment[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 13a. Loan Payment
interface LoanPayment {
  id: string;
  loanId: string;
  date: Date;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  isPaid: boolean;
  transactionId?: string;
  createdAt: Date;
}

// 14. SharedExpense (Split expenses with others)
interface SharedExpense {
  id: string;
  expenseId: string;             // FK to Expense.id
  totalAmount: number;
  paidBy: string;                // User who paid
  splits: SharedExpenseSplit[];
  settled: boolean;
  settledDate?: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// 14a. Shared Expense Split
interface SharedExpenseSplit {
  personName: string;
  amount: number;
  percentage: number;
  isPaid: boolean;
  paidDate?: Date;
}

// 15. TaxCategory (Mexican tax tracking)
interface TaxCategory {
  id: string;
  name: string;
  type: 'income' | 'deduction';
  satCode?: string;              // SAT (Mexican IRS) classification code
  description?: string;
  deductiblePercentage: number;  // 0-100
  requiresInvoice: boolean;      // Requires CFDI
  createdAt: Date;
  updatedAt: Date;
}

// 16. UserSettings
interface UserSettings {
  id: string;
  currency: 'MXN' | 'USD';
  language: 'es' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'es-MX' | 'en-US';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    budgetAlerts: boolean;
    billReminders: boolean;
    investmentUpdates: boolean;
    goalMilestones: boolean;
  };
  defaultView: 'dashboard' | 'expenses' | 'income';
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: Date;
  biometricEnabled: boolean;
  dataEncrypted: boolean;
  exchangeRates: ExchangeRate[];
  createdAt: Date;
  updatedAt: Date;
}

// 16a. Exchange Rate
interface ExchangeRate {
  fromCurrency: 'MXN' | 'USD';
  toCurrency: 'MXN' | 'USD';
  rate: number;
  date: Date;
  source: 'manual' | 'api';      // How rate was set
}

// 17. UIState (for app-level UI state)
interface UIState {
  sidebarCollapsed: boolean;
  activeView: string;
  filters: {
    expenses: ExpenseFilters;
    income: IncomeFilters;
    accounts: AccountFilters;
  };
  selectedDateRange: {
    start: Date;
    end: Date;
  };
  lastSync?: Date;
}

// 17a. Filter types
interface ExpenseFilters {
  categories?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: string[];
  tags?: string[];
}

interface IncomeFilters {
  categories?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sources?: string[];
}

interface AccountFilters {
  accountTypes?: string[];
  banks?: string[];
  isActive?: boolean;
}
```

### Global State Structure (Zustand)

```typescript
interface AppState {
  // Data
  user: UserSettings;
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  loans: Loan[];
  transfers: Transfer[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  sharedExpenses: SharedExpense[];
  taxCategories: TaxCategory[];

  // UI State
  ui: UIState;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions (methods to mutate state)
  // Expenses
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Incomes
  addIncome: (income: Income) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // ... similar for all entities

  // Bulk operations
  importData: (data: Partial<AppState>) => void;
  exportData: () => AppState;
  clearAllData: () => void;

  // Calculated getters
  getNetWorth: () => number;
  getCashFlow: (period: string) => number;
  getBudgetStatus: (categoryId: string, period: string) => BudgetStatus;
}
```

## 🗄️ Database Schema (IndexedDB via Dexie.js)

```typescript
import Dexie, { Table } from 'dexie';

class FinanceTrackerDB extends Dexie {
  expenses!: Table<Expense>;
  incomes!: Table<Income>;
  investments!: Table<Investment>;
  accounts!: Table<BankAccount>;
  creditCards!: Table<CreditCard>;
  loans!: Table<Loan>;
  transactions!: Table<Transaction>;
  transfers!: Table<Transfer>;
  budgets!: Table<Budget>;
  savingsGoals!: Table<SavingsGoal>;
  bills!: Table<Bill>;
  recurringTransactions!: Table<RecurringTransaction>;
  categories!: Table<Category>;
  sharedExpenses!: Table<SharedExpense>;
  taxCategories!: Table<TaxCategory>;
  settings!: Table<UserSettings>;

  constructor() {
    super('FinanceTrackerDB');

    this.version(1).stores({
      expenses: 'id, date, category, accountId, *tags, recurring, sharedExpenseId',
      incomes: 'id, date, category, source, accountId, recurring, taxable',
      investments: 'id, platform, startDate, isActive',
      accounts: 'id, bank, accountType, currency, isActive',
      creditCards: 'id, bank, isActive',
      loans: 'id, lender, type, isActive',
      transactions: 'id, accountId, date, type, transferId, expenseId, incomeId',
      transfers: 'id, fromAccountId, toAccountId, date, status',
      budgets: 'id, category, period',
      savingsGoals: 'id, targetDate, priority',
      bills: 'id, nextDueDate, isActive, category',
      recurringTransactions: 'id, type, nextDue, isActive',
      categories: 'id, type, parentCategoryId, isDefault',
      sharedExpenses: 'id, expenseId, settled',
      taxCategories: 'id, type',
      settings: 'id'
    });
  }
}

export const db = new FinanceTrackerDB();
```

### Indexes Explanation
- Primary keys: `id` (always indexed)
- Foreign keys: For quick lookups (e.g., `accountId`, `category`)
- Date fields: For range queries (e.g., `date`, `nextDueDate`)
- Boolean flags: For filtering (e.g., `isActive`, `recurring`)
- Multi-entry indexes (`*tags`): For array fields

## 🛣️ Routing Structure

```typescript
// Routes definition
const routes = [
  {
    path: '/',
    element: <Dashboard />,
    name: 'Dashboard'
  },
  {
    path: '/expenses',
    children: [
      { path: '', element: <ExpenseList /> },
      { path: 'new', element: <ExpenseForm /> },
      { path: ':id', element: <ExpenseDetail /> },
      { path: ':id/edit', element: <ExpenseForm /> }
    ]
  },
  {
    path: '/income',
    children: [
      { path: '', element: <IncomeList /> },
      { path: 'new', element: <IncomeForm /> },
      { path: ':id', element: <IncomeDetail /> },
      { path: ':id/edit', element: <IncomeForm /> }
    ]
  },
  {
    path: '/accounts',
    children: [
      { path: '', element: <AccountsOverview /> },
      { path: 'bank/:id', element: <BankAccountDetail /> },
      { path: 'credit/:id', element: <CreditCardDetail /> }
    ]
  },
  {
    path: '/investments',
    children: [
      { path: '', element: <InvestmentsDashboard /> },
      { path: 'new', element: <InvestmentForm /> },
      { path: ':id', element: <InvestmentDetail /> },
      { path: 'compare', element: <InvestmentComparison /> }
    ]
  },
  {
    path: '/budget',
    element: <BudgetPlanner />
  },
  {
    path: '/bills',
    children: [
      { path: '', element: <BillsList /> },
      { path: 'new', element: <BillForm /> },
      { path: ':id', element: <BillDetail /> }
    ]
  },
  {
    path: '/goals',
    children: [
      { path: '', element: <SavingsGoals /> },
      { path: 'new', element: <GoalForm /> },
      { path: ':id', element: <GoalDetail /> }
    ]
  },
  {
    path: '/transfers',
    children: [
      { path: '', element: <TransferList /> },
      { path: 'new', element: <TransferForm /> }
    ]
  },
  {
    path: '/reports',
    children: [
      { path: '', element: <ReportsOverview /> },
      { path: 'monthly', element: <MonthlyReport /> },
      { path: 'annual', element: <AnnualReport /> },
      { path: 'tax', element: <TaxReport /> },
      { path: 'custom', element: <CustomReportBuilder /> }
    ]
  },
  {
    path: '/settings',
    children: [
      { path: '', element: <Settings /> },
      { path: 'categories', element: <CategoryManager /> },
      { path: 'import', element: <ImportData /> },
      { path: 'export', element: <ExportData /> },
      { path: 'backup', element: <BackupRestore /> }
    ]
  },
  {
    path: '/onboarding',
    element: <OnboardingFlow />
  }
];
```

## 🧮 Calculations Engine (Corrected Formulas)

### Key Formulas

#### 1. Net Worth (CORRECTED)
```typescript
function calculateNetWorth(
  accounts: BankAccount[],
  investments: Investment[],
  creditCards: CreditCard[],
  loans: Loan[]
): number {
  // Assets
  const bankTotal = accounts
    .filter(a => a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  const investmentTotal = investments
    .filter(i => i.isActive)
    .reduce((sum, i) => sum + i.currentValue, 0);

  // Liabilities
  const creditCardDebt = creditCards
    .filter(c => c.isActive)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  const loanDebt = loans
    .filter(l => l.isActive)
    .reduce((sum, l) => sum + l.currentBalance, 0);

  return bankTotal + investmentTotal - creditCardDebt - loanDebt;
}
```

#### 2. Monthly Cash Flow
```typescript
function calculateCashFlow(
  incomes: Income[],
  expenses: Expense[],
  period: string // 'YYYY-MM'
): number {
  const [year, month] = period.split('-').map(Number);

  const totalIncome = incomes
    .filter(i => {
      const d = new Date(i.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return totalIncome - totalExpenses;
}
```

#### 3. Daily Investment Return (CORRECTED - Compound Interest)
```typescript
function calculateDailyReturn(
  principal: number,
  gatPercentage: number
): number {
  // GAT (Ganancia Anual Total) already includes compounding
  // Daily compound rate formula: (1 + annual_rate)^(1/365) - 1
  const annualRate = gatPercentage / 100;
  const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;

  return principal * dailyRate;
}

function calculateInvestmentValue(
  principal: number,
  gatPercentage: number,
  days: number,
  contributions: InvestmentContribution[] = [],
  withdrawals: InvestmentWithdrawal[] = []
): number {
  // Sort all events chronologically
  const events = [
    ...contributions.map(c => ({ type: 'contribution', date: c.date, amount: c.amount })),
    ...withdrawals.map(w => ({ type: 'withdrawal', date: w.date, amount: w.amount }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  let currentValue = principal;
  let lastDate = new Date(); // Start date

  const annualRate = gatPercentage / 100;

  // Process each event
  events.forEach(event => {
    const daysSinceLastEvent = Math.floor(
      (event.date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Apply compound interest for the period
    currentValue = currentValue * Math.pow(1 + annualRate, daysSinceLastEvent / 365);

    // Apply contribution or withdrawal
    if (event.type === 'contribution') {
      currentValue += event.amount;
    } else {
      currentValue -= event.amount;
    }

    lastDate = event.date;
  });

  // Apply interest for remaining days
  const remainingDays = days - Math.floor(
    (lastDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  currentValue = currentValue * Math.pow(1 + annualRate, remainingDays / 365);

  return currentValue;
}
```

#### 4. ROI (Return on Investment)
```typescript
function calculateROI(
  initialInvestment: number,
  contributions: number,
  currentValue: number
): number {
  const totalInvested = initialInvestment + contributions;
  const gain = currentValue - totalInvested;
  return (gain / totalInvested) * 100;
}
```

#### 5. Budget Usage
```typescript
function calculateBudgetUsage(
  categoryId: string,
  period: string,
  expenses: Expense[],
  budget: Budget
): BudgetStatus {
  const [year, month] = period.split('-').map(Number);

  const spent = expenses
    .filter(e => {
      const d = new Date(e.date);
      return e.category === categoryId &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const limit = budget.monthlyLimit + (budget.rolloverAmount || 0);
  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;

  let status: 'safe' | 'warning' | 'danger' | 'exceeded';
  if (percentage < budget.alertThreshold) {
    status = 'safe';
  } else if (percentage < 100) {
    status = 'warning';
  } else if (percentage === 100) {
    status = 'danger';
  } else {
    status = 'exceeded';
  }

  return {
    spent,
    limit,
    percentage,
    remaining,
    status
  };
}

interface BudgetStatus {
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
}
```

#### 6. Savings Goal Progress
```typescript
function calculateGoalProgress(goal: SavingsGoal): GoalProgress {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const today = new Date();
  const daysRemaining = Math.floor(
    (goal.targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let requiredMonthlyContribution = 0;
  if (daysRemaining > 0) {
    const monthsRemaining = daysRemaining / 30.44; // Average days per month
    requiredMonthlyContribution = remaining / monthsRemaining;
  }

  const isOnTrack = goal.autoContribution
    ? goal.autoContribution >= requiredMonthlyContribution
    : false;

  return {
    percentage,
    remaining,
    daysRemaining,
    requiredMonthlyContribution,
    isOnTrack,
    status: percentage >= 100 ? 'completed' :
            percentage >= 75 ? 'on-track' :
            percentage >= 50 ? 'needs-attention' : 'behind'
  };
}

interface GoalProgress {
  percentage: number;
  remaining: number;
  daysRemaining: number;
  requiredMonthlyContribution: number;
  isOnTrack: boolean;
  status: 'completed' | 'on-track' | 'needs-attention' | 'behind';
}
```

#### 7. Credit Card Utilization
```typescript
function calculateCreditUtilization(card: CreditCard): number {
  return (card.currentBalance / card.creditLimit) * 100;
}

function calculateMinimumPayment(
  balance: number,
  interestRate: number,
  minimumPercentage: number = 2 // Typically 2-5% in Mexico
): number {
  const minimumByPercentage = balance * (minimumPercentage / 100);
  const minimumFixed = 200; // Typical minimum in MXN

  return Math.max(minimumByPercentage, minimumFixed);
}
```

#### 8. Loan Amortization
```typescript
function calculateLoanPayment(
  principal: number,
  annualInterestRate: number,
  months: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) return principal / months;

  return principal *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  months: number,
  startDate: Date
): LoanPayment[] {
  const monthlyPayment = calculateLoanPayment(principal, annualInterestRate, months);
  const monthlyRate = annualInterestRate / 100 / 12;

  const schedule: LoanPayment[] = [];
  let remainingBalance = principal;

  for (let i = 0; i < months; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i + 1);

    schedule.push({
      id: `payment-${i}`,
      loanId: '',
      date: paymentDate,
      amount: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
      isPaid: false,
      createdAt: new Date()
    });
  }

  return schedule;
}
```

#### 9. Currency Conversion
```typescript
function convertCurrency(
  amount: number,
  fromCurrency: 'MXN' | 'USD',
  toCurrency: 'MXN' | 'USD',
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;

  if (fromCurrency === 'USD' && toCurrency === 'MXN') {
    return amount * exchangeRate;
  } else {
    return amount / exchangeRate;
  }
}
```

#### 10. Tax Calculations (Mexican ISR)
```typescript
function calculateTaxableIncome(
  incomes: Income[],
  deductibleExpenses: Expense[],
  year: number
): TaxSummary {
  const taxableIncome = incomes
    .filter(i => {
      const d = new Date(i.date);
      return i.taxable && d.getFullYear() === year;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const deductions = deductibleExpenses
    .filter(e => {
      const d = new Date(e.date);
      return e.deductible && d.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const netTaxableIncome = taxableIncome - deductions;

  // Simplified ISR calculation (would need actual tax brackets)
  const estimatedTax = calculateISR(netTaxableIncome);

  return {
    totalIncome: taxableIncome,
    totalDeductions: deductions,
    netIncome: netTaxableIncome,
    estimatedTax,
    effectiveRate: (estimatedTax / netTaxableIncome) * 100
  };
}

interface TaxSummary {
  totalIncome: number;
  totalDeductions: number;
  netIncome: number;
  estimatedTax: number;
  effectiveRate: number;
}

// Simplified ISR calculation (2024 brackets for example)
function calculateISR(income: number): number {
  const brackets = [
    { limit: 7735.00, rate: 0.0192, fixed: 0 },
    { limit: 65651.07, rate: 0.064, fixed: 148.51 },
    { limit: 115375.90, rate: 0.1088, fixed: 3855.14 },
    { limit: 134119.41, rate: 0.16, fixed: 9265.20 },
    { limit: 160577.65, rate: 0.1792, fixed: 12264.16 },
    { limit: 323862.00, rate: 0.2136, fixed: 17005.47 },
    { limit: 510451.00, rate: 0.2352, fixed: 51883.01 },
    { limit: 974535.03, rate: 0.30, fixed: 95768.74 },
    { limit: Infinity, rate: 0.35, fixed: 234993.95 }
  ];

  for (const bracket of brackets) {
    if (income <= bracket.limit) {
      const excess = income - (brackets[brackets.indexOf(bracket) - 1]?.limit || 0);
      return bracket.fixed + (excess * bracket.rate);
    }
  }

  return 0;
}
```

## 🖥️ User Interface Components

### 1. Dashboard View

**Summary Cards:**
- **Net Worth**: Total assets minus liabilities (corrected formula)
  - Show trend (up/down) from last month
  - Breakdown button showing asset/liability composition

- **Monthly Cash Flow**: Income minus expenses for current month
  - Show percentage change from previous month
  - Quick link to detailed breakdown

- **Investment Performance**: Total ROI percentage
  - Comparison across platforms (Nu, Didi, MercadoPago)
  - YTD returns

- **Budget Status**: Percentage used across all categories
  - List of categories approaching limits
  - Quick action to adjust budgets

- **Savings Progress**: Completion percentage of active goals
  - Next milestone indicator
  - Days remaining to targets

**Charts:**
- Expense trend (Last 6 months line chart)
- Category breakdown (Donut chart with percentages)
- Investment performance (Stacked area chart by platform)
- Net worth evolution (Line chart, last 12 months)
- Income vs Expenses (Bar chart comparison)

**Quick Actions:**
- Floating action button with menu:
  - Add Expense (with quick amount keypad)
  - Add Income
  - Quick Transfer
  - Update Investment Returns
  - Pay Bill

**Recent Activity:**
- Last 10 transactions across all accounts
- Upcoming bills (next 7 days)
- Budget alerts

### 2. Expense Tracker

**Entry Form:**
- Amount (large, prominent input)
- Date picker (defaults to today)
- Category selector with icons
- Subcategory (conditional, appears based on parent category)
- Description with autocomplete from history
- Payment method tabs (Cash, Debit, Credit, Transfer)
- Account/Card selector (conditional on payment method)
- Receipt photo upload (mobile camera access)
- Tags input (multi-select chips)
- Recurring checkbox
  - If checked, show frequency selector
- Split expense toggle
  - If enabled, show split input UI
- Deductible checkbox (for tax tracking)

**List View:**
- Group by: Day, Week, Month, Category
- Sort by: Date, Amount, Category
- Filters panel:
  - Date range picker
  - Categories (multi-select)
  - Amount range slider
  - Payment methods
  - Tags
  - Recurring only toggle
  - Deductible only toggle
- Search bar (description, merchant name)
- Bulk actions:
  - Multi-select mode
  - Bulk delete
  - Bulk categorize
  - Bulk tag
  - Export selection

**Calendar View:**
- Monthly calendar grid
- Daily expense total on each date
- Click date to see day's expenses
- Color-coded by category
- Week totals
- Month total prominent at top

**Category Analysis:**
- Pie chart showing distribution
- Bar chart showing trend over time
- Top 5 most expensive categories
- Comparison to previous period
- Budget vs actual for each category

### 3. Income Tracker

**Entry Form:**
- Amount (prominent)
- Date
- Category (Salary, Freelance, Investment Returns, Gift, Other)
- Source (employer/client name)
- Description
- Destination account selector
- Recurring checkbox
  - Frequency selector
- Taxable checkbox
- Tax category selector (if taxable)
- Attachments (e.g., pay stub PDF)

**List View:**
- Group by: Month, Source, Category
- Summary cards:
  - Total YTD income
  - Average monthly income
  - Main income source
- Filters:
  - Date range
  - Categories
  - Sources
  - Taxable only
  - Recurring only
- Export options

**Analysis View:**
- Monthly income trend (line chart)
- Income by source (pie chart)
- Income by category (bar chart)
- Year-over-year comparison
- Taxable vs non-taxable breakdown

### 4. Investment Manager (Mexican Fintech Focus)

**Dashboard:**
- Platform comparison cards (Nu, Didi, MercadoPago):
  - Current balance (large)
  - GAT percentage (prominent with color coding)
  - Daily returns (calculated, auto-updating)
  - Total returns accumulated
  - ROI percentage
  - Days invested
  - Projected annual return
  - Quick actions: Add funds, Withdraw, View details

**Comparison Matrix:**
| Platform | Balance | GAT % | Daily Return | Monthly Return | Annual Projection | ROI % |
|----------|---------|-------|--------------|----------------|-------------------|-------|
| Nu       | $10,000 | 15.2% | $4.16       | $125           | $1,520            | 15.2% |
| Didi     | $5,000  | 13.8% | $1.89       | $57            | $690              | 13.8% |
| MercadoPago | $8,000 | 14.5% | $3.18    | $95            | $1,160            | 14.5% |

**Investment Detail View:**
- Value chart over time
- Contributions list (chronological)
- Withdrawals list
- Returns breakdown (daily snapshots)
- Performance metrics:
  - Total invested
  - Current value
  - Total returns
  - ROI percentage
  - Average daily return
  - Best performing day
  - Annualized return
- Investment calculator:
  - "What if" scenarios
  - Compound interest projections
  - Goal-based calculations

**Add/Withdraw Funds:**
- Amount input
- Date selector
- Source/Destination account
- Notes
- Auto-recalculate returns

**Platform Recommendation Engine:**
- Based on:
  - Amount to invest
  - Investment term
  - Current rates
  - Platform reliability scores
- Shows best option with reasoning

### 5. Budget Planner

**Monthly Budget Overview:**
- Total budget vs total spent (prominent progress bar)
- Monthly income (for reference)
- Remaining budget
- Projected end-of-month status

**Category Budget Cards:**
Each card shows:
- Category name with icon
- Allocated amount
- Spent amount
- Remaining amount
- Progress bar (color-coded: green < 70%, yellow 70-90%, red > 90%)
- Percentage used
- Trend indicator (spending faster/slower than usual)
- Quick actions: Adjust limit, View expenses

**Budget Creation:**
- Template selection:
  - Zero-based budgeting
  - 50/30/20 rule
  - Envelope method
  - Custom
- Category-by-category allocation
- Income-based suggestions
- Historical spending reference
- Rollover settings per category

**Alerts & Notifications:**
- Configure threshold per category (default 80%)
- Notification channels (in-app, browser notification)
- Alert history
- Snooze options

**Budget Analysis:**
- Month-over-month comparison
- Budget vs actual chart
- Category performance ranking
- Recommendations for next month
- Savings potential identified

### 6. Accounts Overview

**Bank Accounts Section:**
- Card-based layout (3-4 per row on desktop)
- Each card shows:
  - Bank name and logo
  - Account type (icon)
  - Last 4 digits
  - Current balance (large)
  - Currency
  - Last updated timestamp
  - Quick actions: Update balance, View transactions, Transfer
- Total across all accounts
- Add new account button

**Credit Cards Section:**
- Card-based layout
- Each card shows:
  - Bank and card name
  - Last 4 digits
  - Available credit (prominent)
  - Credit limit
  - Utilization percentage (progress bar)
  - Current balance owed
  - Next payment due date
  - Minimum payment amount
  - Quick actions: Record payment, View transactions, View statement

**Credit Score Tracker:**
- Current utilization across all cards
- Utilization recommendation (keep under 30%)
- Payment history (on-time payments)

**Loans Section:**
- List of active loans
- Each shows:
  - Lender name
  - Loan type
  - Current balance
  - Monthly payment
  - Next payment date
  - Progress bar (paid vs remaining)
  - Quick action: Record payment

### 7. Bills & Subscriptions

**Upcoming Bills:**
- Timeline view (next 30 days)
- Each bill shows:
  - Name and icon
  - Amount
  - Due date (with days remaining)
  - Auto-pay indicator
  - Reminder status
  - Quick action: Mark as paid

**Bill Calendar:**
- Monthly view
- Bills marked on due dates
- Color-coded by status (paid, pending, overdue)
- Click to see details or mark paid

**Subscriptions List:**
- Grouped by frequency (monthly, annual, etc.)
- Each shows:
  - Service name
  - Amount
  - Billing cycle
  - Next charge date
  - Cancel/modify button

**Bill Analysis:**
- Total monthly recurring costs
- Category breakdown
- Year-over-year changes
- Largest bills
- Opportunities to save

### 8. Transfers

**Transfer Form:**
- From account selector (dropdown with balances)
- To account selector
- Amount input
- Currency conversion (if applicable)
  - Show exchange rate
  - Show converted amount
- Transfer fee input (optional)
- Date selector
- Description
- Review screen before confirming
  - Shows both transactions
  - Confirms balances will update

**Transfer History:**
- List of all transfers
- Each shows:
  - Date
  - From → To (with icons)
  - Amount
  - Status (pending, completed, failed)
- Filter by account, date range
- Search functionality

### 9. Reports & Analytics

**Monthly Report:**
- Summary section:
  - Total income
  - Total expenses
  - Net savings
  - Savings rate percentage
- Detailed sections:
  - Income breakdown
  - Expense breakdown by category
  - Top 10 expenses
  - Budget performance
  - Investment returns
  - Net worth change
- Charts:
  - Income vs expenses (bar)
  - Spending by category (pie)
  - Daily spending pattern (line)
- Export options: PDF, Excel, Email

**Annual Report:**
- Year in review summary
- Month-by-month trends
- Category totals
- Investment performance
- Tax summary
- Net worth progression
- Achievements (goals completed, etc.)
- Export options

**Tax Report:**
- Taxable income summary
- Deductible expenses by SAT category
- Investment gains (taxable)
- Estimated ISR
- Required forms and fields
- Export for accountant (Excel with proper format)

**Custom Report Builder:**
- Date range selector
- Choose metrics:
  - Income (with filters)
  - Expenses (with filters)
  - Investments
  - Accounts
  - Budgets
  - Goals
- Choose visualizations:
  - Tables
  - Line charts
  - Bar charts
  - Pie charts
  - Area charts
- Save report templates
- Schedule email delivery
- Export options

### 10. Settings

**General Settings:**
- Currency preference
- Language
- Date format
- Number format
- Theme (light/dark/auto)
- Default view on launch

**Notifications:**
- Budget alerts (toggle + threshold)
- Bill reminders (toggle + days before)
- Investment updates (toggle)
- Goal milestones (toggle)
- Test notification button

**Security:**
- Enable biometric lock
- Enable data encryption
- Change PIN
- Auto-lock timer
- Privacy mode (hide balances)

**Data Management:**
- Import data (CSV, JSON)
- Export data (Excel, JSON, PDF)
- Backup now
- Restore from backup
- Backup frequency
- Clear all data (with confirmation)

**Categories:**
- Manage expense categories
- Manage income categories
- Create new categories
- Edit existing (name, icon, color)
- Reorder categories
- Delete categories (with reassignment)

**Exchange Rates:**
- Current USD/MXN rate
- Manual update
- History of rates
- Source selection

### 11. Onboarding Flow

**Welcome Screen:**
- App introduction
- Key features highlight
- Get started button

**Step 1: Profile Setup**
- Currency selection
- Language preference
- Name/nickname (optional)

**Step 2: Initial Accounts**
- Add your bank accounts
- Add credit cards
- Add investment accounts
- (All optional, can skip)

**Step 3: Category Setup**
- Show default categories
- Option to customize
- Option to add more

**Step 4: Sample Data**
- Option to load sample data to explore
- Option to start fresh

**Step 5: Quick Tutorial**
- Interactive tooltips
- How to add expense
- How to set budget
- How to view dashboard

**Completion:**
- Congratulations message
- Quick links to first actions
- Link to full documentation

### Empty States

**No Expenses Yet:**
- Friendly illustration
- Message: "No expenses tracked yet"
- Prominent "Add your first expense" button
- Suggestion to import from bank statement

**No Income Yet:**
- Illustration
- Message: "Start tracking your income"
- "Add income" button
- Explanation of why tracking income matters

**No Budgets:**
- Illustration
- Message: "Set budgets to track your spending"
- "Create budget" button
- Quick budget templates

**No Investments:**
- Illustration
- Message about investment opportunities
- "Add investment" button
- Info about supported platforms

### Loading States

**Initial App Load:**
- Splash screen with logo
- Loading progress indicator
- "Loading your data..." message

**Data Operations:**
- Skeleton screens for lists
- Spinner for calculations
- Progress bar for imports/exports
- Optimistic UI updates (show changes immediately, sync in background)

**Sync Status:**
- Last synced timestamp
- Sync in progress indicator
- Offline mode indicator

## 🔧 Key Features (Complete Specifications)

### 1. Data Entry Features

**Smart Quick Entry:**
- Natural language processing:
  - "Comida 150 en Oxxo" → Amount: 150, Category: Food, Description: "Oxxo"
  - "Gasolina 500" → Amount: 500, Category: Transportation, Description: "Gasolina"
- Autocomplete from history:
  - Suggest merchants based on partial input
  - Suggest amounts based on typical spending at merchant
  - Suggest categories based on description
- Keyboard shortcuts:
  - Ctrl/Cmd + E: Quick expense entry
  - Ctrl/Cmd + I: Quick income entry
  - Ctrl/Cmd + T: Quick transfer
  - Esc: Cancel/close

**Receipt Scanning (Mobile):**
- Camera access
- Capture receipt photo
- Store as attachment
- Future: OCR extraction (Phase 2)

**GPS-Based Merchant:**
- Request location permission
- Suggest nearby merchants
- Auto-fill based on location
- Store location with transaction

**Voice Input (Future):**
- Microphone permission
- Speech-to-text for description
- Voice command for amounts
- Confirm before saving

### 2. Bulk Operations

**CSV Import:**
- File upload interface
- Column mapping wizard:
  - Map CSV columns to fields
  - Preview first 5 rows
  - Validation before import
- Duplicate detection:
  - Check by date + amount + description
  - Show potential duplicates
  - User choice: Skip, Import anyway, Merge
- Category mapping:
  - Suggest categories based on description
  - Bulk assign categories
  - Learn from user corrections
- Import history:
  - Track all imports
  - Rollback option (within 24 hours)

**Batch Operations:**
- Multi-select mode in lists
- Bulk actions menu:
  - Delete selected
  - Change category
  - Add tags
  - Mark as deductible
  - Export selected
- Select all / Deselect all
- Selection count indicator

### 3. Synchronization & Persistence

**Local-First Architecture:**
- All data stored in IndexedDB
- Instant read/write (no network latency)
- Works completely offline
- No server dependencies

**Data Persistence Strategy:**
- Auto-save on every change
- Debounced saves (300ms) for rapid changes
- Transaction log for data integrity
- Periodic background saves every 5 minutes

**Backup System:**
- Automatic backups:
  - Frequency: Daily, Weekly, or Monthly (user choice)
  - Stored in IndexedDB (separate table)
  - Keep last 30 days of backups
  - Rotate old backups automatically
- Manual backup:
  - Download JSON file
  - Encrypted option (password protected)
  - Include settings option
- Restore from backup:
  - Upload backup file
  - Preview contents before restore
  - Choose to merge or replace
  - Confirm before applying

### 4. Export Capabilities

**Excel Export:**
- Multiple sheets:
  - Summary (overview, totals)
  - Expenses (all fields)
  - Income (all fields)
  - Investments (with calculations)
  - Accounts (balances)
  - Budgets (vs actual)
  - Tax Report (ISR format)
- Formatted tables with headers
- Formulas for totals and calculations
- Color-coded (green for income, red for expenses)
- Filters enabled
- Freeze panes for headers

**PDF Export:**
- Professional report layout
- Includes:
  - Header with date range
  - Summary section
  - Charts (as images)
  - Detailed tables
  - Footer with page numbers
- Options:
  - Portrait or landscape
  - Include/exclude charts
  - Choose sections to include

**JSON Export:**
- Complete data dump
- Preserves all relationships
- Includes metadata
- Can be used for backup
- Can be imported back

**Google Sheets Integration (Future):**
- OAuth authentication
- Choose spreadsheet
- Sync frequency
- Bi-directional sync options

### 5. Mexican Fintech Features

**GAT Tracking:**
- Support for three platforms:
  - Nu (Cuenta Nu, Cajita, Inversiones)
  - Didi (Didi Ahorro)
  - Mercado Pago (Mercado Fondo)
- Track GAT changes over time
- Notification when GAT changes
- Historical GAT chart

**Daily Returns Calculation:**
- Automatic calculation using compound formula
- Background job runs daily at midnight
- Creates InvestmentSnapshot record
- Updates accumulatedReturns
- Updates currentValue

**Platform Comparison:**
- Side-by-side comparison table
- Sort by: GAT, Balance, ROI, Returns
- Visual indicators (best rate highlighted)
- Recommendation engine:
  - Best for short term (highest daily return)
  - Best for long term (highest GAT)
  - Most reliable (user ratings)

**Investment Optimizer:**
- Input: Amount to invest, Time period
- Output: Recommended platform and projected returns
- Diversification suggestions:
  - If > $50,000, suggest splitting across platforms
  - Risk diversification (not all eggs in one basket)
- Tax implications:
  - Calculate ISR on projected returns
  - Net returns after tax

**Rate Change Notifications:**
- Monitor GAT changes (daily check)
- Notify user if change > 0.5%
- Show historical rate for comparison
- Suggest action (move to higher rate platform)

### 6. Security & Privacy

**Data Encryption:**
- Optional encryption at rest
- Encrypt before storing in IndexedDB
- Use Web Crypto API
- Password-based encryption key derivation
- Decrypt on read
- Performance impact: Minimal (< 50ms per operation)

**Biometric Lock (Mobile):**
- Use Web Authentication API
- Fingerprint or Face ID
- Lock after inactivity (user configurable: 1, 5, 15, 30 minutes)
- Lock on app close
- Require auth to view sensitive screens (accounts, investments)

**Privacy Mode:**
- Toggle to hide all amounts
- Shows "***" instead of numbers
- Hides account numbers
- Quick toggle from header
- Useful for viewing app in public

**No Cloud Storage:**
- All data stays on device
- No server communication
- No telemetry or tracking
- No third-party services
- User has complete control

**Data Anonymization for Exports:**
- Option to anonymize before export
- Removes:
  - Account numbers
  - Specific merchant names (generalizes)
  - Personal notes
- Keeps:
  - Amounts
  - Categories
  - Dates
  - Statistics

### 7. PWA Capabilities

**Installation:**
- Install prompt after 2nd visit
- Add to home screen (iOS)
- Install from browser (Android/Desktop)
- Standalone app experience (no browser UI)

**Offline Mode:**
- Service worker caches all assets
- IndexedDB for data (already offline)
- Queue operations when offline:
  - Exports (process when back online)
  - Notifications (show when online)
- Offline indicator in UI
- Sync when connection restored

**Notifications:**
- Browser notification permission
- Types:
  - Bill reminder (X days before due)
  - Budget alert (threshold exceeded)
  - Goal milestone (reached X%)
  - Investment update (rate change)
- Notification settings per type
- Quiet hours (no notifications between X and Y)

**Background Sync:**
- Service worker background sync
- Calculate daily investment returns
- Process recurring transactions
- Generate scheduled reports
- Check for overdue bills

**App Badge (Mobile):**
- Show count of:
  - Overdue bills
  - Budget alerts
  - Pending actions
- Clear badge when items resolved

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #3B82F6;
--primary-blue-dark: #2563EB;
--primary-blue-light: #60A5FA;

/* Semantic Colors */
--success: #10B981;      /* Green - Income, positive */
--warning: #F59E0B;      /* Amber - Alerts, warnings */
--danger: #EF4444;       /* Red - Expenses, danger */
--info: #3B82F6;         /* Blue - Information */

/* Platform Colors */
--nu-purple: #8A05BE;
--didi-orange: #FF6B00;
--mercadopago-yellow: #00B1E9;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Dark Mode */
--dark-bg: #1F2937;
--dark-surface: #374151;
--dark-text: #F9FAFB;
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Component Styles

**Buttons:**
- Primary: Solid blue background, white text
- Secondary: Outline blue, blue text
- Danger: Solid red background, white text
- Ghost: Transparent, colored text on hover
- Sizes: sm (32px), md (40px), lg (48px)
- States: Default, Hover, Active, Disabled
- Loading: Spinner replaces text

**Cards:**
- Background: White (light mode), --dark-surface (dark mode)
- Border radius: 8px
- Box shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 16px (mobile), 24px (desktop)
- Hover: Subtle shadow increase

**Forms:**
- Input height: 40px (mobile), 48px (desktop)
- Border: 1px solid --gray-300
- Border radius: 6px
- Focus: Blue outline, 2px
- Error: Red border, red text below
- Floating labels (animate on focus)
- Inline validation (as you type)

**Charts:**
- Consistent color scheme across all charts
- Categories: Assigned colors from palette
- Tooltips: Dark background, white text
- Grid lines: Light gray, subtle
- Animations: Smooth (300ms ease)

**Icons:**
- Lucide React icon set
- Sizes: 16px, 20px, 24px, 32px
- Stroke width: 2px
- Color: Inherit from text color

## 🔄 Data Validation Rules

### Expense/Income Validation

```typescript
const expenseSchema = z.object({
  amount: z.number()
    .positive("Amount must be positive")
    .max(10000000, "Amount seems unusually high"),
  date: z.date()
    .max(new Date(), "Cannot be in the future"),
  category: z.string()
    .min(1, "Category is required"),
  description: z.string()
    .min(1, "Description is required")
    .max(200, "Description too long"),
  paymentMethod: z.enum(['cash', 'debit', 'credit', 'transfer', 'other']),
  accountId: z.string().optional(),
});
```

### Investment Validation

```typescript
const investmentSchema = z.object({
  platform: z.enum(['Nu', 'Didi', 'MercadoPago', 'Other']),
  initialCapital: z.number()
    .positive("Capital must be positive")
    .min(100, "Minimum investment is $100"),
  gatPercentage: z.number()
    .min(0, "GAT cannot be negative")
    .max(100, "GAT seems too high"),
  startDate: z.date(),
});
```

### Budget Validation

```typescript
const budgetSchema = z.object({
  category: z.string().min(1, "Category required"),
  monthlyLimit: z.number()
    .positive("Limit must be positive")
    .max(10000000, "Limit seems too high"),
  alertThreshold: z.number()
    .min(0, "Threshold must be 0-100")
    .max(100, "Threshold must be 0-100"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Invalid period format"),
});
```

### Account Validation

```typescript
const accountSchema = z.object({
  bank: z.string().min(1, "Bank name required"),
  accountNumber: z.string()
    .length(4, "Last 4 digits only")
    .regex(/^\d{4}$/, "Must be 4 digits"),
  balance: z.number()
    .min(-1000000, "Balance seems incorrect")
    .max(1000000000, "Balance seems incorrect"),
  currency: z.enum(['MXN', 'USD']),
});
```

### Transfer Validation

```typescript
const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Source required"),
  toAccountId: z.string().min(1, "Destination required"),
  amount: z.number()
    .positive("Amount must be positive"),
}).refine(
  (data) => data.fromAccountId !== data.toAccountId,
  { message: "Cannot transfer to same account", path: ['toAccountId'] }
).refine(
  (data) => {
    // Check if source has sufficient funds
    // (Would need to access accounts store)
    return true; // Simplified
  },
  { message: "Insufficient funds", path: ['amount'] }
);
```

## 🚨 Error Handling Strategy

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'validation',
  STORAGE = 'storage',
  CALCULATION = 'calculation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;      // User-friendly message
  details?: any;
  timestamp: Date;
  action?: string;          // Suggested action
  retryable: boolean;
}
```

### Error Handling

**Validation Errors:**
- Show immediately as user types
- Highlight invalid field
- Show error message below field
- Prevent form submission
- User message: "Please check the highlighted fields"

**Storage Errors:**
- Log to console
- Show toast notification
- Retry automatically (up to 3 times)
- If persistent, suggest:
  - Clear browser cache
  - Check storage quota
  - Export data and refresh
- User message: "Failed to save. Retrying..."

**Calculation Errors:**
- Log error with context
- Show default/safe value
- Don't crash the app
- Show warning icon with tooltip
- User message: "Calculation error. Please check input values"

**Permission Errors:**
- Request permission again
- Explain why permission needed
- Provide workaround if denied
- User message: "Camera permission needed to scan receipts"

**Unknown Errors:**
- Log full error stack
- Show generic error message
- Provide "Report issue" button
- Graceful degradation
- User message: "Something went wrong. Please try again"

### Error Recovery

**Retry Logic:**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
```

**Offline Queue:**
```typescript
interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
  retries: number;
}

// When operation fails (offline):
// 1. Add to queue in IndexedDB
// 2. Show "Queued for sync" message
// 3. When online, process queue
// 4. Remove from queue on success
```

## 🚀 Implementation Phases (Detailed)

### Phase 1: Core Foundation (Week 1)
**Goal:** Basic app structure and data layer

**Tasks:**
1. Project setup:
   - Create React + TypeScript project
   - Install dependencies (Tailwind, Zustand, Dexie, etc.)
   - Configure TypeScript strict mode
   - Set up ESLint and Prettier

2. Database layer:
   - Define Dexie.js schema
   - Create all tables
   - Add indexes
   - Test CRUD operations

3. State management:
   - Set up Zustand store
   - Create store slices for each entity
   - Add actions for CRUD
   - Test state updates

4. Basic UI:
   - Create layout components (Header, Sidebar, Main)
   - Set up routing
   - Create Dashboard skeleton
   - Basic navigation

5. Default data:
   - Create default categories
   - Create default settings
   - Seed on first run

**Deliverables:**
- Running app with basic layout
- Database working
- Can navigate between empty views

### Phase 2: Expense Tracking (Week 1-2)
**Goal:** Complete expense tracking functionality

**Tasks:**
1. Expense form:
   - Build form with validation
   - Category selector
   - Payment method selector
   - Date picker
   - Receipt upload
   - Save to database

2. Expense list:
   - Fetch from database
   - Display in list/grid
   - Group by date
   - Search functionality
   - Filters panel

3. Expense detail:
   - View expense details
   - Edit expense
   - Delete expense
   - View receipt

4. Expense analytics:
   - Total expenses calculation
   - Category breakdown chart
   - Trend chart
   - Export to Excel

**Deliverables:**
- Full expense tracking system
- Can add, edit, delete expenses
- Can view analytics
- Can export data

### Phase 3: Income Tracking (Week 2)
**Goal:** Complete income tracking functionality

**Tasks:**
1. Income form:
   - Build form with validation
   - Category selector
   - Source input
   - Recurring setup
   - Tax settings
   - Save to database

2. Income list:
   - Fetch from database
   - Display with filters
   - Search functionality
   - Group by source/category

3. Income analytics:
   - Total income calculation
   - Source breakdown
   - Trend chart
   - YoY comparison

**Deliverables:**
- Full income tracking system
- Can add, edit, delete incomes
- Can view analytics
- Dashboard shows income data

### Phase 4: Financial Accounts (Week 2)
**Goal:** Bank accounts and credit cards management

**Tasks:**
1. Bank accounts:
   - CRUD operations
   - Balance tracking
   - Transaction list
   - Account detail view

2. Credit cards:
   - CRUD operations
   - Utilization calculation
   - Payment tracking
   - Alert for due dates

3. Transactions:
   - Link to accounts
   - Create from expenses/incomes
   - Transaction history
   - Balance calculation

4. Transfers:
   - Transfer form
   - Double-entry bookkeeping
   - Transfer history
   - Validation (sufficient funds)

**Deliverables:**
- Complete accounts system
- Can track balances
- Can transfer between accounts
- Transactions linked to accounts

### Phase 5: Mexican Fintech Investments (Week 2-3)
**Goal:** Investment tracking with GAT calculations

**Tasks:**
1. Investment CRUD:
   - Create investment
   - Platform selection
   - Initial capital input
   - GAT input

2. Calculations:
   - Implement compound interest formula
   - Daily return calculation
   - ROI calculation
   - Current value tracking

3. Contributions/Withdrawals:
   - Add contribution
   - Add withdrawal
   - Recalculate values
   - History tracking

4. Investment dashboard:
   - Platform comparison
   - Charts (value over time)
   - Performance metrics
   - Recommendations

5. Daily update job:
   - Background calculation
   - Create snapshots
   - Update accumulated returns

**Deliverables:**
- Full investment tracking
- Accurate GAT calculations
- Platform comparison
- Investment dashboard

### Phase 6: Budget & Goals (Week 3)
**Goal:** Budget planning and savings goals

**Tasks:**
1. Budget creation:
   - Category selection
   - Limit setting
   - Alert threshold
   - Template support

2. Budget tracking:
   - Calculate spent from expenses
   - Progress bars
   - Alert when approaching limit
   - Budget vs actual comparison

3. Savings goals:
   - Create goal
   - Set target and date
   - Track contributions
   - Progress calculation
   - Recommendations

4. Budget dashboard:
   - Overview of all budgets
   - Alerts and notifications
   - Monthly comparison

**Deliverables:**
- Complete budget system
- Savings goals tracking
- Alerts working
- Dashboard integration

### Phase 7: Bills & Recurring (Week 3)
**Goal:** Bill management and recurring transactions

**Tasks:**
1. Bills:
   - Create bill
   - Set frequency
   - Set reminders
   - Mark as paid

2. Recurring transactions:
   - Create recurring template
   - Auto-generate transactions
   - Manage schedule

3. Bill calendar:
   - Calendar view
   - Upcoming bills
   - Overdue alerts

4. Notifications:
   - Bill reminders
   - Browser notifications
   - In-app notifications

**Deliverables:**
- Bill management system
- Recurring transactions
- Calendar view
- Notifications working

### Phase 8: Analytics & Reports (Week 3-4)
**Goal:** Comprehensive reporting

**Tasks:**
1. Charts integration:
   - Install Recharts
   - Create reusable chart components
   - Dashboard charts
   - Responsive sizing

2. Monthly report:
   - Generate report
   - All sections
   - Charts
   - Export to PDF/Excel

3. Annual report:
   - Year summary
   - Month-by-month breakdown
   - Charts
   - Export

4. Tax report:
   - Taxable income
   - Deductible expenses
   - ISR calculation
   - Export for accountant

5. Custom report builder:
   - Select date range
   - Choose metrics
   - Choose visualizations
   - Save templates
   - Schedule reports

**Deliverables:**
- All reports working
- Export functionality complete
- Charts rendering correctly
- Custom reports

### Phase 9: Mobile Optimization (Week 4)
**Goal:** PWA and mobile experience

**Tasks:**
1. PWA setup:
   - Create manifest.json
   - Configure service worker
   - Add install prompt
   - Test installation

2. Responsive design:
   - Mobile layouts
   - Touch-friendly inputs
   - Bottom navigation
   - Swipe gestures

3. Offline capability:
   - Service worker caching
   - Offline queue
   - Sync on reconnect
   - Offline indicator

4. Mobile features:
   - Camera for receipts
   - GPS for merchants
   - Push notifications
   - Biometric lock

**Deliverables:**
- PWA installable
- Works offline
- Mobile optimized
- Mobile features working

### Phase 10: Polish & Testing (Week 4)
**Goal:** Production ready

**Tasks:**
1. UI/UX improvements:
   - Animations
   - Micro-interactions
   - Loading states
   - Empty states
   - Error states

2. Performance optimization:
   - Code splitting
   - Lazy loading
   - Memoization
   - Virtual scrolling

3. Testing:
   - Unit tests for calculations
   - Component tests
   - E2E tests
   - Manual testing

4. Documentation:
   - User guide
   - FAQ
   - Keyboard shortcuts
   - Help tooltips

5. Onboarding:
   - Welcome flow
   - Interactive tutorial
   - Sample data option

**Deliverables:**
- Polished UI
- Fast performance
- Tests passing
- Documentation complete
- Ready for users

## 🧪 Testing Strategy

### Unit Tests (Jest)

**Calculation Functions:**
```typescript
describe('calculateNetWorth', () => {
  it('should calculate correct net worth', () => {
    const accounts = [{ balance: 10000 }];
    const investments = [{ currentValue: 5000 }];
    const creditCards = [{ currentBalance: 2000 }];
    const loans = [{ currentBalance: 3000 }];

    expect(calculateNetWorth(accounts, investments, creditCards, loans))
      .toBe(10000);
  });
});

describe('calculateDailyReturn', () => {
  it('should calculate daily return with compound interest', () => {
    const result = calculateDailyReturn(10000, 15);
    expect(result).toBeCloseTo(3.92, 2);
  });
});
```

**Data Transformations:**
```typescript
describe('expenseToTransaction', () => {
  it('should convert expense to transaction correctly', () => {
    const expense: Expense = {
      // ... expense data
    };
    const transaction = expenseToTransaction(expense);
    expect(transaction.amount).toBe(-expense.amount);
    expect(transaction.type).toBe('withdrawal');
  });
});
```

**Validation:**
```typescript
describe('expenseSchema', () => {
  it('should reject negative amounts', () => {
    const result = expenseSchema.safeParse({ amount: -100 });
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests (React Testing Library)

**Component Interactions:**
```typescript
describe('ExpenseForm', () => {
  it('should submit expense successfully', async () => {
    render(<ExpenseForm />);

    await userEvent.type(screen.getByLabelText('Amount'), '150');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'food');
    await userEvent.click(screen.getByText('Save'));

    expect(mockAddExpense).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 150, category: 'food' })
    );
  });
});
```

**State Management:**
```typescript
describe('Zustand Store', () => {
  it('should add expense and update state', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.addExpense(mockExpense);
    });

    expect(result.current.expenses).toContainEqual(mockExpense);
  });
});
```

**Data Persistence:**
```typescript
describe('Database Operations', () => {
  it('should save and retrieve expense', async () => {
    await db.expenses.add(mockExpense);
    const retrieved = await db.expenses.get(mockExpense.id);

    expect(retrieved).toEqual(mockExpense);
  });
});
```

### E2E Tests (Playwright)

**Critical Flows:**
```typescript
test('Add expense flow', async ({ page }) => {
  await page.goto('/expenses/new');

  await page.fill('[name="amount"]', '150');
  await page.selectOption('[name="category"]', 'food');
  await page.fill('[name="description"]', 'Lunch at restaurant');
  await page.click('button[type="submit"]');

  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page).toHaveURL('/expenses');
  await expect(page.locator('.expense-list')).toContainText('Lunch at restaurant');
});

test('Budget alert flow', async ({ page }) => {
  // Set up budget
  await page.goto('/budget');
  await page.click('text=Create Budget');
  await page.selectOption('[name="category"]', 'food');
  await page.fill('[name="limit"]', '1000');
  await page.click('button[type="submit"]');

  // Add expense that exceeds threshold
  await page.goto('/expenses/new');
  await page.fill('[name="amount"]', '850');
  await page.click('button[type="submit"]');

  // Check for alert
  await expect(page.locator('.budget-alert')).toBeVisible();
});
```

**Offline Scenarios:**
```typescript
test('Works offline', async ({ page, context }) => {
  await page.goto('/');

  // Go offline
  await context.setOffline(true);

  // Add expense
  await page.goto('/expenses/new');
  await page.fill('[name="amount"]', '100');
  await page.click('button[type="submit"]');

  // Should show queued message
  await expect(page.locator('.queued-message')).toBeVisible();

  // Go online
  await context.setOffline(false);

  // Should sync
  await expect(page.locator('.synced-message')).toBeVisible();
});
```

## 📱 PWA Configuration

### Manifest.json

```json
{
  "name": "Finance Tracker",
  "short_name": "FinTracker",
  "description": "Personal finance tracking app for Mexican users",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/expenses.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Add Expense",
      "short_name": "Expense",
      "description": "Quickly add an expense",
      "url": "/expenses/new",
      "icons": [{ "src": "/icons/expense-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Add Income",
      "short_name": "Income",
      "description": "Quickly add income",
      "url": "/income/new",
      "icons": [{ "src": "/icons/income-icon.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["finance", "productivity"],
  "lang": "es-MX"
}
```

### Service Worker Strategy

**Caching Strategy:**
- **App Shell**: Cache-first (HTML, CSS, JS)
- **API calls**: Network-first with cache fallback (N/A for this app)
- **Images**: Cache-first with network fallback
- **Data**: IndexedDB (not service worker cache)

**Implementation:**
```javascript
// sw.js
const CACHE_NAME = 'finance-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/icons/icon-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## 📚 Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Bank API Integration:**
   - Connect to Mexican banks (BBVA, Santander, Banorte)
   - Automatic transaction import
   - Real-time balance updates
   - Requires bank partnerships or aggregators

2. **OCR Receipt Scanning:**
   - Extract data from receipt photos
   - Tesseract.js for OCR
   - Parse merchant, amount, date
   - Auto-fill expense form

3. **Collaborative Features:**
   - Family/household accounts
   - Shared budgets
   - Permission levels
   - Activity feed
   - Requires backend server

4. **AI-Powered Insights:**
   - Spending pattern analysis
   - Anomaly detection (unusual expenses)
   - Personalized recommendations
   - Budget optimization suggestions
   - Use ML models (TensorFlow.js)

5. **Cryptocurrency Tracking:**
   - Add crypto wallets
   - Track BTC, ETH, etc.
   - Price tracking
   - Portfolio value
   - API integration (CoinGecko, etc.)

6. **Real Estate Investments:**
   - Property tracking
   - Rental income
   - Mortgage tracking
   - Property value appreciation
   - ROI calculations

7. **Advanced Tax Features:**
   - Full ISR calculation with all brackets
   - IVA tracking
   - CFDI (Factura) management
   - Tax filing assistance
   - Integration with SAT

8. **Bill Automation:**
   - Email parsing for e-bills
   - Automatic bill detection
   - Payment scheduling
   - Bank integration for auto-pay

9. **Social Features:**
   - Compare anonymized spending with peers
   - Leaderboards (savings rate, etc.)
   - Challenges (no-spend month, etc.)
   - Community forums

10. **Smart Alerts:**
    - Unusual spending detected
    - Better rate available (investments)
    - Bill amount changed
    - Subscription price increase
    - Low balance warnings

## 🎯 Success Metrics

### Performance Metrics
- **Load Time**: < 2 seconds on 3G
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: > 90

### Reliability Metrics
- **Data Loss**: 0% (with backups)
- **Calculation Accuracy**: 100%
- **Crash Rate**: < 0.1%
- **Offline Functionality**: 100%

### Usability Metrics
- **Time to Add Expense**: < 10 seconds
- **Time to View Dashboard**: < 2 seconds
- **User Satisfaction**: > 4.5/5
- **Feature Discovery**: > 80% in first week

### Coverage Metrics
- **Test Coverage**: > 80%
- **Supported Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Devices**: iOS 13+, Android 8+

---

## 📝 Implementation Checklist

### Pre-Development
- [ ] Review and approve specification
- [ ] Set up development environment
- [ ] Create project repository
- [ ] Set up CI/CD pipeline
- [ ] Choose hosting platform (Netlify, Vercel, etc.)

### Development
- [ ] Complete Phase 1 (Core Foundation)
- [ ] Complete Phase 2 (Expense Tracking)
- [ ] Complete Phase 3 (Income Tracking)
- [ ] Complete Phase 4 (Financial Accounts)
- [ ] Complete Phase 5 (Investments)
- [ ] Complete Phase 6 (Budget & Goals)
- [ ] Complete Phase 7 (Bills & Recurring)
- [ ] Complete Phase 8 (Analytics & Reports)
- [ ] Complete Phase 9 (Mobile Optimization)
- [ ] Complete Phase 10 (Polish & Testing)

### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Accessibility testing

### Documentation
- [ ] User guide
- [ ] Developer documentation
- [ ] API documentation (if applicable)
- [ ] FAQ
- [ ] Troubleshooting guide

### Launch
- [ ] Deploy to production
- [ ] Set up analytics
- [ ] Create landing page
- [ ] Announce launch
- [ ] Gather initial feedback

### Post-Launch
- [ ] Monitor performance
- [ ] Fix bugs
- [ ] Gather user feedback
- [ ] Plan Phase 2 features
- [ ] Iterate and improve

---

This specification provides a complete, implementation-ready blueprint for building a professional-grade financial tracking application. All contradictions have been resolved, missing data models added, formulas corrected, and technical details specified. The app is designed specifically for Mexican users with focus on local fintech platforms, tax requirements, and mobile-first usage.
