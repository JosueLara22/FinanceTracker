import { Investment, InvestmentSnapshot } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate the daily return for an investment based on its current state
 * @param investment The investment to calculate for
 * @param currentValue The current value (used for compound interest)
 * @returns The daily return amount
 */
export function calculateDailyReturn(investment: Investment, currentValue?: number): number {
  const value = currentValue ?? investment.currentValue;
  const principal = investment.autoReinvest ? value : investment.initialCapital;
  const annualRate = investment.gatPercentage / 100;

  // Calculate daily return using simple formula: (principal × GAT%) / 365
  return (principal * annualRate) / 365;
}

/**
 * Calculate compound interest growth for a given number of days
 * @param principal Starting amount
 * @param annualRate Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param days Number of days
 * @returns Final value after compound growth
 */
export function calculateCompoundGrowth(principal: number, annualRate: number, days: number): number {
  // Compound interest formula: P × (1 + r)^t where r is daily rate
  const dailyRate = Math.pow(1 + annualRate, 1 / 365) - 1;
  return principal * Math.pow(1 + dailyRate, days);
}

/**
 * Calculate simple interest growth for a given number of days
 * @param principal Starting amount
 * @param annualRate Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param days Number of days
 * @returns Final value after simple growth
 */
export function calculateSimpleGrowth(principal: number, annualRate: number, days: number): number {
  // Simple interest formula: P × (1 + r × t) where r is annual rate, t is time in years
  return principal * (1 + (annualRate * days / 365));
}

/**
 * Calculate ROI percentage
 * @param currentValue Current investment value
 * @param initialCapital Initial investment amount
 * @returns ROI as percentage
 */
export function calculateROI(currentValue: number, initialCapital: number): number {
  if (initialCapital === 0) return 0;
  return ((currentValue - initialCapital) / initialCapital) * 100;
}

/**
 * Normalize a date to midnight (00:00:00) for consistent comparisons
 * @param date Date to normalize
 * @returns Normalized date
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Calculate the number of days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of whole days
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate daily snapshots for an investment from lastUpdate to today
 * @param investment The investment to generate snapshots for
 * @returns Array of snapshots, one per day
 */
export function generateDailySnapshots(investment: Investment): InvestmentSnapshot[] {
  const now = new Date();
  const lastUpdate = new Date(investment.lastUpdate);
  const daysPassed = daysBetween(lastUpdate, now);

  if (daysPassed <= 0) {
    return []; // No days to process
  }

  const snapshots: InvestmentSnapshot[] = [];
  let currentValue = investment.currentValue;
  let accumulatedReturns = investment.accumulatedReturns;

  // Generate a snapshot for each day
  for (let i = 1; i <= daysPassed; i++) {
    const snapshotDate = new Date(lastUpdate);
    snapshotDate.setDate(snapshotDate.getDate() + i);

    // Calculate daily return for this day
    const dailyReturn = calculateDailyReturn(investment, currentValue);

    // Update values
    accumulatedReturns += dailyReturn;
    currentValue += dailyReturn;

    // Create snapshot
    snapshots.push({
      id: uuidv4(),
      investmentId: investment.id,
      date: normalizeDate(snapshotDate),
      value: currentValue,
      accumulatedReturns: accumulatedReturns,
      dailyReturn: dailyReturn,
      createdAt: new Date(),
    });
  }

  return snapshots;
}

/**
 * Generate historical snapshots from investment start date to lastUpdate
 * Used for backfilling data for existing investments
 * @param investment The investment to backfill
 * @returns Array of historical snapshots
 */
export function generateHistoricalSnapshots(investment: Investment): InvestmentSnapshot[] {
  const startDate = new Date(investment.startDate);
  const lastUpdate = new Date(investment.lastUpdate);
  const totalDays = daysBetween(startDate, lastUpdate);

  if (totalDays <= 0) {
    return []; // No history to generate
  }

  const snapshots: InvestmentSnapshot[] = [];
  let currentValue = investment.initialCapital;
  let accumulatedReturns = 0;

  // Generate a snapshot for each day from start to lastUpdate
  for (let i = 1; i <= totalDays; i++) {
    const snapshotDate = new Date(startDate);
    snapshotDate.setDate(snapshotDate.getDate() + i);

    // Calculate daily return for this day
    const dailyReturn = calculateDailyReturn(investment, currentValue);

    // Update values
    accumulatedReturns += dailyReturn;
    currentValue += dailyReturn;

    // Create snapshot
    snapshots.push({
      id: uuidv4(),
      investmentId: investment.id,
      date: normalizeDate(snapshotDate),
      value: currentValue,
      accumulatedReturns: accumulatedReturns,
      dailyReturn: dailyReturn,
      createdAt: new Date(),
    });
  }

  return snapshots;
}

/**
 * Calculate projected future value for an investment
 * @param investment The investment
 * @param daysInFuture Number of days to project into the future
 * @returns Projected future value
 */
export function projectFutureValue(investment: Investment, daysInFuture: number): number {
  const annualRate = investment.gatPercentage / 100;

  if (investment.autoReinvest) {
    return calculateCompoundGrowth(investment.currentValue, annualRate, daysInFuture);
  } else {
    return calculateSimpleGrowth(investment.currentValue, annualRate, daysInFuture);
  }
}
