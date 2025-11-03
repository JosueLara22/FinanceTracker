import { db } from '../data/db';
import { Investment, InvestmentSnapshot } from '../types';
import {
  generateDailySnapshots,
  generateHistoricalSnapshots,
  daysBetween,
  normalizeDate
} from '../utils/investmentCalculations';

/**
 * Service for automatically updating investment returns
 */
export class InvestmentUpdateService {
  private static instance: InvestmentUpdateService;
  private isUpdating = false;

  private constructor() {}

  static getInstance(): InvestmentUpdateService {
    if (!InvestmentUpdateService.instance) {
      InvestmentUpdateService.instance = new InvestmentUpdateService();
    }
    return InvestmentUpdateService.instance;
  }

  /**
   * Update all investments that need daily updates
   * This should be called on app initialization
   */
  async updateAllInvestments(): Promise<void> {
    if (this.isUpdating) {
      console.log('Investment update already in progress');
      return;
    }

    this.isUpdating = true;

    try {
      const investments = await db.investments.toArray();

      console.log(`Checking ${investments.length} investments for updates...`);

      for (const investment of investments) {
        await this.updateSingleInvestment(investment);
      }

      console.log('All investments updated successfully');
    } catch (error) {
      console.error('Error updating investments:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update a single investment with daily snapshots
   * @param investment The investment to update
   */
  async updateSingleInvestment(investment: Investment): Promise<void> {
    try {
      const now = new Date();
      const lastUpdate = new Date(investment.lastUpdate);
      const daysPassed = daysBetween(lastUpdate, now);

      if (daysPassed <= 0) {
        console.log(`Investment ${investment.id} is up to date`);
        return; // Already up to date
      }

      console.log(`Updating investment ${investment.id} - ${daysPassed} days to process`);

      // Generate snapshots for missed days
      const snapshots = generateDailySnapshots(investment);

      if (snapshots.length === 0) {
        return;
      }

      // Save all snapshots to database
      await db.investmentSnapshots.bulkAdd(snapshots);

      // Update the investment record with latest values
      const latestSnapshot = snapshots[snapshots.length - 1];
      await db.investments.update(investment.id, {
        currentValue: latestSnapshot.value,
        accumulatedReturns: latestSnapshot.accumulatedReturns,
        dailyReturn: latestSnapshot.dailyReturn,
        lastUpdate: now,
      });

      console.log(`Investment ${investment.id} updated successfully`);
    } catch (error) {
      console.error(`Error updating investment ${investment.id}:`, error);
      throw error;
    }
  }

  /**
   * Backfill historical snapshots for an investment
   * Used when an investment exists but has no snapshots
   * @param investment The investment to backfill
   */
  async backfillHistoricalData(investment: Investment): Promise<void> {
    try {
      // Check if we already have snapshots
      const existingSnapshots = await db.investmentSnapshots
        .where('investmentId')
        .equals(investment.id)
        .count();

      if (existingSnapshots > 0) {
        console.log(`Investment ${investment.id} already has snapshots, skipping backfill`);
        return;
      }

      console.log(`Backfilling historical data for investment ${investment.id}...`);

      // Generate all historical snapshots
      const snapshots = generateHistoricalSnapshots(investment);

      if (snapshots.length === 0) {
        console.log(`No historical data to backfill for investment ${investment.id}`);
        return;
      }

      // Save all snapshots
      await db.investmentSnapshots.bulkAdd(snapshots);

      console.log(`Backfilled ${snapshots.length} snapshots for investment ${investment.id}`);
    } catch (error) {
      console.error(`Error backfilling investment ${investment.id}:`, error);
      throw error;
    }
  }

  /**
   * Backfill historical data for all investments
   * Should be called once after adding the snapshot feature
   */
  async backfillAllInvestments(): Promise<void> {
    try {
      const investments = await db.investments.toArray();

      console.log(`Backfilling historical data for ${investments.length} investments...`);

      for (const investment of investments) {
        await this.backfillHistoricalData(investment);
      }

      console.log('Historical backfill completed');
    } catch (error) {
      console.error('Error during historical backfill:', error);
      throw error;
    }
  }

  /**
   * Get snapshots for a specific investment within a date range
   * @param investmentId Investment ID
   * @param startDate Start date (inclusive)
   * @param endDate End date (inclusive)
   */
  async getSnapshots(
    investmentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InvestmentSnapshot[]> {
    let query = db.investmentSnapshots.where('investmentId').equals(investmentId);

    const snapshots = await query.toArray();

    // Filter by date range if provided
    let filtered = snapshots;
    if (startDate) {
      const normalizedStart = normalizeDate(startDate);
      filtered = filtered.filter(s => new Date(s.date) >= normalizedStart);
    }
    if (endDate) {
      const normalizedEnd = normalizeDate(endDate);
      filtered = filtered.filter(s => new Date(s.date) <= normalizedEnd);
    }

    // Sort by date ascending
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get aggregated snapshots for all investments by platform
   * Useful for the investment chart
   */
  async getAggregatedSnapshotsByPlatform(
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ date: Date } & Record<string, number | Date>>> {
    try {
      const investments = await db.investments.toArray();
      const allSnapshots = await db.investmentSnapshots.toArray();

      // Filter snapshots by date range
      let filtered = allSnapshots;
      if (startDate) {
        const normalizedStart = normalizeDate(startDate);
        filtered = filtered.filter(s => new Date(s.date) >= normalizedStart);
      }
      if (endDate) {
        const normalizedEnd = normalizeDate(endDate);
        filtered = filtered.filter(s => new Date(s.date) <= normalizedEnd);
      }

      // Group snapshots by date
      const snapshotsByDate = new Map<string, InvestmentSnapshot[]>();
      for (const snapshot of filtered) {
        const dateKey = normalizeDate(new Date(snapshot.date)).toISOString().split('T')[0];
        if (!snapshotsByDate.has(dateKey)) {
          snapshotsByDate.set(dateKey, []);
        }
        snapshotsByDate.get(dateKey)!.push(snapshot);
      }

      // Aggregate by platform
      const result: Array<{ date: Date } & Record<string, number | Date>> = [];
      for (const [dateKey, snapshots] of snapshotsByDate) {
        const aggregated: Record<string, number | Date> = {
          date: new Date(dateKey),
        };

        for (const snapshot of snapshots) {
          const investment = investments.find(inv => inv.id === snapshot.investmentId);
          if (investment) {
            if (typeof aggregated[investment.platform] !== 'number') {
              aggregated[investment.platform] = 0;
            }
            aggregated[investment.platform] = (aggregated[investment.platform] as number) + snapshot.value;
          }
        }

        result.push(aggregated as { date: Date } & Record<string, number | Date>);
      }

      // Sort by date
      return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error getting aggregated snapshots:', error);
      return [];
    }
  }
}

// Export singleton instance
export const investmentUpdateService = InvestmentUpdateService.getInstance();
