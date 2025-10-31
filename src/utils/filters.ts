/**
 * Utility functions for filtering data in the Financial Tracker app
 */

import { Expense, Income } from '../types';
import { isDateInRange } from './dateUtils';

/**
 * Filter expenses based on various criteria
 */
export const filterExpenses = (
  expenses: Expense[],
  filters: {
    searchTerm?: string;
    categories?: string[];
    paymentMethods?: string[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    tags?: string[];
  }
): Expense[] => {
  return expenses.filter((expense) => {
    // Search term filter (searches in description and category)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(searchLower);
      const matchesCategory = expense.category.toLowerCase().includes(searchLower);
      const matchesSubcategory = expense.subcategory?.toLowerCase().includes(searchLower);

      if (!matchesDescription && !matchesCategory && !matchesSubcategory) {
        return false;
      }
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(expense.category)) {
        return false;
      }
    }

    // Payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      if (!filters.paymentMethods.includes(expense.paymentMethod)) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      if (!isDateInRange(expense.date, filters.startDate || null, filters.endDate || null)) {
        return false;
      }
    }

    // Amount range filter
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      if (expense.amount < filters.minAmount) {
        return false;
      }
    }
    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      if (expense.amount > filters.maxAmount) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!expense.tags || !filters.tags.some(tag => expense.tags?.includes(tag))) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Filter incomes based on various criteria
 */
export const filterIncomes = (
  incomes: Income[],
  filters: {
    searchTerm?: string;
    categories?: string[];
    sources?: string[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
  }
): Income[] => {
  return incomes.filter((income) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesDescription = income.description.toLowerCase().includes(searchLower);
      const matchesCategory = income.category.toLowerCase().includes(searchLower);
      const matchesSource = income.source.toLowerCase().includes(searchLower);

      if (!matchesDescription && !matchesCategory && !matchesSource) {
        return false;
      }
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(income.category)) {
        return false;
      }
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(income.source)) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      if (!isDateInRange(income.date, filters.startDate || null, filters.endDate || null)) {
        return false;
      }
    }

    // Amount range filter
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      if (income.amount < filters.minAmount) {
        return false;
      }
    }
    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      if (income.amount > filters.maxAmount) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort expenses by various criteria
 */
export const sortExpenses = (
  expenses: Expense[],
  sortBy: 'date' | 'amount' | 'category' | 'description',
  order: 'asc' | 'desc' = 'desc'
): Expense[] => {
  const sorted = [...expenses].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        compareValue = a.amount - b.amount;
        break;
      case 'category':
        compareValue = a.category.localeCompare(b.category);
        break;
      case 'description':
        compareValue = a.description.localeCompare(b.description);
        break;
    }

    return order === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
};

/**
 * Sort incomes by various criteria
 */
export const sortIncomes = (
  incomes: Income[],
  sortBy: 'date' | 'amount' | 'category' | 'source',
  order: 'asc' | 'desc' = 'desc'
): Income[] => {
  const sorted = [...incomes].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        compareValue = a.amount - b.amount;
        break;
      case 'category':
        compareValue = a.category.localeCompare(b.category);
        break;
      case 'source':
        compareValue = a.source.localeCompare(b.source);
        break;
    }

    return order === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
};

/**
 * Get unique values from an array of objects by a specific key
 */
export const getUniqueValues = <T>(array: T[], key: keyof T): string[] => {
  const values = array.map(item => {
    const value = item[key];
    return typeof value === 'string' ? value : String(value);
  });
  return Array.from(new Set(values)).filter(Boolean).sort();
};

/**
 * Get unique payment methods from expenses
 */
export const getUniquePaymentMethods = (expenses: Expense[]): string[] => {
  return getUniqueValues(expenses, 'paymentMethod');
};

/**
 * Get unique categories from expenses
 */
export const getUniqueCategories = (expenses: Expense[]): string[] => {
  return getUniqueValues(expenses, 'category');
};

/**
 * Get unique tags from expenses
 */
export const getUniqueTags = (expenses: Expense[]): string[] => {
  const allTags = expenses.flatMap(expense => expense.tags || []);
  return Array.from(new Set(allTags)).filter(Boolean).sort();
};

/**
 * Group expenses by category
 */
export const groupExpensesByCategory = (expenses: Expense[]): Record<string, Expense[]> => {
  return expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

/**
 * Group expenses by month
 */
export const groupExpensesByMonth = (expenses: Expense[]): Record<string, Expense[]> => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

/**
 * Calculate total amount from expenses
 */
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calculate average amount from expenses
 */
export const calculateAverage = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;
  return calculateTotal(expenses) / expenses.length;
};

/**
 * Get category totals from expenses
 */
export const getCategoryTotals = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
};
