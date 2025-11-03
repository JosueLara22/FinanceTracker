import React, { useMemo } from 'react';
import { Investment } from '../../types';
import { calculateROI } from '../../utils/investmentCalculations';

interface InvestmentComparisonProps {
  investments: Investment[];
}

interface PlatformStats {
  platform: string;
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  roi: number;
  averageGAT: number;
  count: number;
}

export const InvestmentComparison: React.FC<InvestmentComparisonProps> = ({ investments }) => {
  const platformStats = useMemo(() => {
    if (investments.length === 0) return [];

    // Group by platform
    const grouped = investments.reduce((acc, inv) => {
      if (!acc[inv.platform]) {
        acc[inv.platform] = [];
      }
      acc[inv.platform].push(inv);
      return acc;
    }, {} as Record<string, Investment[]>);

    // Calculate stats for each platform
    const stats: PlatformStats[] = Object.entries(grouped).map(([platform, invs]) => {
      const totalInvested = invs.reduce((sum, inv) => sum + inv.initialCapital, 0);
      const currentValue = invs.reduce((sum, inv) => sum + inv.currentValue, 0);
      const totalReturns = invs.reduce((sum, inv) => sum + inv.accumulatedReturns, 0);
      const averageGAT = invs.reduce((sum, inv) => sum + inv.gatPercentage, 0) / invs.length;
      const roi = calculateROI(currentValue, totalInvested);

      return {
        platform,
        totalInvested,
        currentValue,
        totalReturns,
        roi,
        averageGAT,
        count: invs.length,
      };
    });

    // Sort by ROI descending
    return stats.sort((a, b) => b.roi - a.roi);
  }, [investments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getTotalStats = () => {
    return platformStats.reduce(
      (acc, stat) => ({
        totalInvested: acc.totalInvested + stat.totalInvested,
        currentValue: acc.currentValue + stat.currentValue,
        totalReturns: acc.totalReturns + stat.totalReturns,
      }),
      { totalInvested: 0, currentValue: 0, totalReturns: 0 }
    );
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  if (investments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-300">Platform Comparison</h2>
        <p className="text-center text-gray-500">No investments to compare yet.</p>
      </div>
    );
  }

  const totals = getTotalStats();
  const overallROI = calculateROI(totals.currentValue, totals.totalInvested);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">Platform Comparison</h2>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
          <p className="text-lg font-bold dark:text-gray-300">{formatCurrency(totals.totalInvested)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totals.currentValue)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Returns</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totals.totalReturns)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall ROI</p>
          <p className={`text-lg font-bold ${overallROI >= 0 ? 'text-success' : 'text-danger'}`}>
            {overallROI.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Platform Ranking Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Platform</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Invested</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Current Value</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Returns</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">ROI</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg GAT</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300"># Invs</th>
            </tr>
          </thead>
          <tbody>
            {platformStats.map((stat, index) => (
              <tr
                key={stat.platform}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <td className="py-3 px-2 text-sm">
                  <span className="font-semibold">{getRankEmoji(index)}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-300">{stat.platform}</span>
                </td>
                <td className="py-3 px-2 text-right text-sm text-gray-700 dark:text-gray-400">
                  {formatCurrency(stat.totalInvested)}
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-success">
                  {formatCurrency(stat.currentValue)}
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-success">
                  {formatCurrency(stat.totalReturns)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded ${
                      stat.roi >= overallROI
                        ? 'bg-green-100 text-success dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {stat.roi.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-sm text-gray-700 dark:text-gray-400">
                  {stat.averageGAT.toFixed(2)}%
                </td>
                <td className="py-3 px-2 text-center text-sm text-gray-700 dark:text-gray-400">
                  {stat.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformStats.length > 0 && (
          <>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">🏆 Best Performer</p>
              <p className="font-bold text-lg text-gray-800 dark:text-gray-300">{platformStats[0].platform}</p>
              <p className="text-sm text-success font-semibold">{platformStats[0].roi.toFixed(2)}% ROI</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📈 Highest GAT</p>
              {(() => {
                const highest = [...platformStats].sort((a, b) => b.averageGAT - a.averageGAT)[0];
                return (
                  <>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-300">{highest.platform}</p>
                    <p className="text-sm text-primary-DEFAULT font-semibold">{highest.averageGAT.toFixed(2)}% Avg</p>
                  </>
                );
              })()}
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">💰 Largest Portfolio</p>
              {(() => {
                const largest = [...platformStats].sort((a, b) => b.currentValue - a.currentValue)[0];
                return (
                  <>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-300">{largest.platform}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                      {formatCurrency(largest.currentValue)}
                    </p>
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
