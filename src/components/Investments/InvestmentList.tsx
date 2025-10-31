import React from 'react';
import { Investment } from '../../types';

interface InvestmentListProps {
  investments: Investment[];
  onUpdateInvestment: (id: string, updates: Partial<Investment>) => void;
  onDeleteInvestment: (id: string) => void;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onUpdateInvestment, onDeleteInvestment }) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  /**
   * Calculates and applies the investment returns from the last update until today.
   * It calculates the number of days passed and iteratively applies daily interest.
   * The interest calculation respects the 'autoReinvest' flag to switch between
   * simple and compound interest.
   * @param {Investment} investment The investment object to update.
   */
  const handleUpdateReturns = (investment: Investment) => {
    const now = new Date();
    const lastUpdate = new Date(investment.lastUpdate);
    const timeDiff = now.getTime() - lastUpdate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysPassed > 0) {
      let newCurrentValue = investment.currentValue;
      let newAccumulatedReturns = investment.accumulatedReturns;

      for (let i = 0; i < daysPassed; i++) {
        const dailyInterest = investment.autoReinvest 
          ? (newCurrentValue * (investment.gatPercentage / 100)) / 365
          : (investment.initialCapital * (investment.gatPercentage / 100)) / 365;
        
        newAccumulatedReturns += dailyInterest;
        newCurrentValue += dailyInterest;
      }

      onUpdateInvestment(investment.id, {
        currentValue: newCurrentValue,
        accumulatedReturns: newAccumulatedReturns,
        lastUpdate: now,
      });
    }
  };

  if (investments.length === 0) {
    return <p className="text-center text-gray-500">No investments recorded yet. Add one to get started!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investments.map(investment => {
        const roi = investment.initialCapital > 0 
          ? ((investment.currentValue - investment.initialCapital) / investment.initialCapital) * 100
          : 0;

        return (
          <div key={investment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl dark:text-gray-300">{investment.platform}</h3>
                <span className="text-sm font-semibold text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{investment.type}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Started: {new Date(investment.startDate).toLocaleDateString('es-MX')}</p>
            </div>
            
            <div className="my-4 text-gray-800 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Initial Capital:</span>
                <span className="font-semibold">{formatCurrency(investment.initialCapital)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Value:</span>
                <span className="font-bold text-2xl text-green-600 dark:text-green-400">{formatCurrency(investment.currentValue)}</span>
              </div>
               <div className="flex justify-between">
                <span>Accumulated Returns:</span>
                <span className="font-semibold text-green-500 dark:text-green-400">{formatCurrency(investment.accumulatedReturns)}</span>
              </div>
              <div className="flex justify-between">
                <span>ROI:</span>
                <span className={`font-bold ${roi >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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
                <span>Daily Return (approx.):</span>
                <span className="font-semibold">{formatCurrency(investment.dailyReturn)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button onClick={() => handleUpdateReturns(investment)} className="text-sm text-blue-500 hover:underline">Update Returns</button>
              <button onClick={() => onDeleteInvestment(investment.id)} className="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  );
};