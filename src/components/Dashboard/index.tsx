
import React, { useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { useInvestments } from '../../hooks/useInvestments';
import { useAccounts } from '../../hooks/useAccounts';
import { useCreditCards } from '../../hooks/useCreditCards';
import { CategoryChart } from './CategoryChart';
import { ExpenseChart } from './ExpenseChart';
import { InvestmentChart } from './InvestmentChart';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <p className="text-3xl font-bold text-primary-DEFAULT dark:text-primary-dark my-2">{value}</p>
    <p className="text-gray-400 dark:text-gray-500 text-xs">{description}</p>
  </div>
);

interface DashboardProps {
  onAddExpenseClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddExpenseClick }) => {
  const { expenses } = useExpenses();
  const { investments } = useInvestments();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();

  /**
   * Calculates and memoizes the core dashboard metrics.
   * This prevents recalculation on every render unless the underlying data changes.
   * @returns {{netWorth: number, investmentRoi: number, monthlyExpenses: number}} An object containing the calculated metrics.
   */
  const metrics = useMemo(() => {
    // Calculate total assets from bank accounts and investments
    const totalAssets = 
      accounts.reduce((sum, acc) => sum + acc.balance, 0) + 
      investments.reduce((sum, inv) => sum + inv.currentValue, 0);

    // Calculate total liabilities from credit cards
    const totalLiabilities = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);

    /**
     * Net Worth: The total value of all assets minus all liabilities.
     */
    const netWorth = totalAssets - totalLiabilities;

    // Calculate total investment capital and current value to determine ROI
    const totalInvestmentCapital = investments.reduce((sum, inv) => sum + inv.initialCapital, 0);
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    
    /**
     * Investment ROI: The total return on investment across all investment accounts.
     * Calculated as ((Current Value - Initial Capital) / Initial Capital) * 100.
     */
    const investmentRoi = totalInvestmentCapital > 0 
      ? ((totalInvestmentValue - totalInvestmentCapital) / totalInvestmentCapital) * 100 
      : 0;

    /**
     * Monthly Expenses: The sum of all expenses recorded in the current calendar month.
     */
    const monthlyExpenses = expenses
      .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      netWorth,
      investmentRoi,
      monthlyExpenses
    };
  }, [expenses, investments, accounts, creditCards]);

  return (
    <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <DashboardCard 
                title="Net Worth" 
                value={formatCurrency(metrics.netWorth)} 
                description="Total Assets - Total Liabilities"
            />
            <DashboardCard 
                title="Investment ROI" 
                value={`${metrics.investmentRoi.toFixed(2)}%`} 
                description="Total Return on Investment"
            />
            <DashboardCard 
                title="Monthly Expenses" 
                value={formatCurrency(metrics.monthlyExpenses)} 
                description="Expenses this month"
            />
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="flex space-x-4">

                <button onClick={onAddExpenseClick} className="bg-primary-DEFAULT text-white px-4 py-2 rounded-lg shadow hover:bg-primary-dark transition-colors">
                    Add Expense
                </button>
                <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg shadow cursor-not-allowed" disabled>
                    Update Investment Returns
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <ExpenseChart expenses={expenses} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <CategoryChart expenses={expenses} />
            </div>
        </div>

        <div className="mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <InvestmentChart investments={investments} />
            </div>
        </div>
    </div>
  );
};
