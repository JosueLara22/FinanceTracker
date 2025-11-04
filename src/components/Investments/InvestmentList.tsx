import React, { useEffect } from 'react';
import { Investment } from '../../types';
import { calculateDailyReturn, calculateROI } from '../../utils/investmentCalculations';
import { useAccountStore } from '../../stores/useAccountStore';

interface InvestmentListProps {
  investments: Investment[];
  onUpdateInvestment: (id: string, updates: Partial<Investment>) => void;
  onDeleteInvestment: (id: string) => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onDeleteInvestment }) => {
  const { accounts, loadAccounts } = useAccountStore();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getSourceAccountName = (sourceAccountId?: string) => {
    if (!sourceAccountId) return null;
    const account = accounts.find(acc => acc.id === sourceAccountId);
    return account ? `${account.bankName} (****${account.accountNumber})` : 'Account not found';
  };

  if (investments.length === 0) {
    return <p className="text-center text-gray-500">No investments recorded yet. Add one to get started!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investments.map(investment => {
        // Calculate ROI using utility function
        const roi = calculateROI(investment.currentValue, investment.initialCapital);

        // Calculate current daily return (dynamically based on current value)
        const currentDailyReturn = calculateDailyReturn(investment);

        // Calculate days since last update
        const now = new Date();
        const lastUpdate = new Date(investment.lastUpdate);
        const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div key={investment.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl dark:text-gray-300">{investment.platform}</h3>
                <span className="text-sm font-semibold text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{investment.type}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Started: {new Date(investment.startDate).toLocaleDateString('es-MX')}</p>
              {investment.sourceAccountId && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  💳 Funded from: {getSourceAccountName(investment.sourceAccountId)}
                </p>
              )}
              {daysSinceUpdate > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Last updated {daysSinceUpdate} day{daysSinceUpdate > 1 ? 's' : ''} ago
                </p>
              )}
            </div>

            <div className="my-4 text-gray-800 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Initial Capital:</span>
                <span className="font-semibold">{formatCurrency(investment.initialCapital)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Value:</span>
                <span className="font-bold text-2xl text-success">{formatCurrency(investment.currentValue)}</span>
              </div>
               <div className="flex justify-between">
                <span>Accumulated Returns:</span>
                <span className="font-semibold text-success">{formatCurrency(investment.accumulatedReturns)}</span>
              </div>
              <div className="flex justify-between">
                <span>ROI:</span>
                <span className={`font-bold ${roi >= 0 ? 'text-success' : 'text-danger'}`}>
                  {roi.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-800 dark:text-gray-300">
              <div className="flex justify-between">
                <span>GAT:</span>
                <span className="font-semibold">{investment.gatPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Return (current):</span>
                <span className="font-semibold">{formatCurrency(currentDailyReturn)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Auto-reinvest:</span>
                <span>{investment.autoReinvest ? 'Yes (Compound)' : 'No (Simple)'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {daysSinceUpdate === 0 ? '✓ Up to date' : '⟳ Updates automatically'}
              </span>
              <button onClick={() => onDeleteInvestment(investment.id)} className="text-sm text-danger hover:underline">Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  );
};