/**
 * Utility functions for date operations in the Financial Tracker app
 */

/**
 * Gets the start of today
 */
export const getStartOfToday = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Gets the end of today
 */
export const getEndOfToday = (): Date => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Gets the start of the current week (Monday)
 */
export const getStartOfWeek = (): Date => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Gets the end of the current week (Sunday)
 */
export const getEndOfWeek = (): Date => {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

/**
 * Gets the start of the current month
 */
export const getStartOfMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Gets the end of the current month
 */
export const getEndOfMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Gets the start of the current year
 */
export const getStartOfYear = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
};

/**
 * Gets the end of the current year
 */
export const getEndOfYear = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
};

/**
 * Gets the start of the previous month
 */
export const getStartOfLastMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - 1, 1, 0, 0, 0, 0);
};

/**
 * Gets the end of the previous month
 */
export const getEndOfLastMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
};

/**
 * Gets the date N days ago
 */
export const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Gets the date N months ago
 */
export const getMonthsAgo = (months: number): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Checks if a date is within a date range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string | null,
  endDate: Date | string | null
): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (startDate && endDate) {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return d >= start && d <= end;
  } else if (startDate) {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    return d >= start;
  } else if (endDate) {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return d <= end;
  }

  return true;
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

/**
 * Checks if a date is in the current month
 */
export const isThisMonth = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

/**
 * Checks if a date is in the current year
 */
export const isThisYear = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getFullYear() === today.getFullYear();
};

/**
 * Gets the period string (YYYY-MM) for a date
 */
export const getPeriodString = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Compares two dates (ignoring time)
 */
export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
};

/**
 * Gets an array of months between two dates
 */
export const getMonthsBetween = (startDate: Date, endDate: Date): Date[] => {
  const months: Date[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};
