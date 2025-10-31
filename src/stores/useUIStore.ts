import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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

interface Filters {
  expenses: ExpenseFilters;
  income: IncomeFilters;
  accounts: AccountFilters;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface UIState {
  // UI State
  isLoading: boolean;
  activeView: string;
  selectedPeriod: string; // Format: 'YYYY-MM'
  selectedDateRange: DateRange;
  filters: Filters;
  sidebarCollapsed: boolean;
  lastSync?: Date;

  // Actions
  setLoading: (loading: boolean) => void;
  setActiveView: (view: string) => void;
  setSelectedPeriod: (period: string) => void;
  setSelectedDateRange: (range: DateRange) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setExpenseFilters: (filters: Partial<ExpenseFilters>) => void;
  setIncomeFilters: (filters: Partial<IncomeFilters>) => void;
  setAccountFilters: (filters: Partial<AccountFilters>) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLastSync: (date: Date) => void;
  resetFilters: () => void;

  // Utility
  getCurrentMonthPeriod: () => string;
  getDateRangeForPeriod: (period: string) => DateRange;
}

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getDefaultDateRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        isLoading: false,
        activeView: 'dashboard',
        selectedPeriod: getCurrentMonth(),
        selectedDateRange: getDefaultDateRange(),
        filters: {
          expenses: {},
          income: {},
          accounts: {},
        },
        sidebarCollapsed: false,
        lastSync: undefined,

        setLoading: (loading) => set({ isLoading: loading }),

        setActiveView: (view) => set({ activeView: view }),

        setSelectedPeriod: (period) => {
          const dateRange = get().getDateRangeForPeriod(period);
          set({ selectedPeriod: period, selectedDateRange: dateRange });
        },

        setSelectedDateRange: (range) => set({ selectedDateRange: range }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        setExpenseFilters: (expenseFilters) =>
          set((state) => ({
            filters: {
              ...state.filters,
              expenses: { ...state.filters.expenses, ...expenseFilters },
            },
          })),

        setIncomeFilters: (incomeFilters) =>
          set((state) => ({
            filters: {
              ...state.filters,
              income: { ...state.filters.income, ...incomeFilters },
            },
          })),

        setAccountFilters: (accountFilters) =>
          set((state) => ({
            filters: {
              ...state.filters,
              accounts: { ...state.filters.accounts, ...accountFilters },
            },
          })),

        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        setLastSync: (date) => set({ lastSync: date }),

        resetFilters: () =>
          set({
            filters: {
              expenses: {},
              income: {},
              accounts: {},
            },
          }),

        getCurrentMonthPeriod: () => getCurrentMonth(),

        getDateRangeForPeriod: (period: string): DateRange => {
          const [year, month] = period.split('-').map(Number);
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 0);
          return { start, end };
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          activeView: state.activeView,
          selectedPeriod: state.selectedPeriod,
          sidebarCollapsed: state.sidebarCollapsed,
          filters: state.filters,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
