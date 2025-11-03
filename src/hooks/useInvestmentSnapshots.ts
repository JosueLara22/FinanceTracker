import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { InvestmentSnapshot } from '../types';
import { investmentUpdateService } from '../services/investmentUpdateService';

/**
 * Hook for working with investment snapshots
 */
export function useInvestmentSnapshots(investmentId?: string) {
  // Get snapshots for specific investment or all snapshots
  const snapshots = useLiveQuery(
    async () => {
      if (investmentId) {
        return await db.investmentSnapshots
          .where('investmentId')
          .equals(investmentId)
          .toArray();
      }
      return await db.investmentSnapshots.toArray();
    },
    [investmentId]
  );

  /**
   * Get snapshots within a date range
   */
  const getSnapshotsInRange = async (
    investmentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InvestmentSnapshot[]> => {
    return await investmentUpdateService.getSnapshots(investmentId, startDate, endDate);
  };

  /**
   * Get aggregated snapshots by platform for charts
   */
  const getAggregatedByPlatform = async (
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ date: Date } & Record<string, number | Date>>> => {
    return await investmentUpdateService.getAggregatedSnapshotsByPlatform(startDate, endDate);
  };

  return {
    snapshots: snapshots || [],
    getSnapshotsInRange,
    getAggregatedByPlatform,
  };
}
