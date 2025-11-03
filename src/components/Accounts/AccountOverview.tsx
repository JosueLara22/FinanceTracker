import React, { useCallback, useState } from 'react';
import { useAccountStore } from '../../stores';
import { runManualReconciliation } from '../../stores';
import { Wallet, CreditCard as CreditCardIcon, TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw, Info } from 'lucide-react';

export const AccountOverview: React.FC = () => {
  const { accounts, creditCards, calculateNetWorth, calculateTotalCreditUtilization } = useAccountStore();
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);

  const handleReconcile = useCallback(async () => {
    setIsReconciling(true);
    setReconcileMessage(null);

    try {
      console.log('[AccountOverview] Starting manual reconciliation...');
      const report = await runManualReconciliation();

      // Show success message with details
      const message = `✅ Reconciliation complete! Fixed ${report.reconciliation.balancesFixed} accounts, cleaned up ${report.orphanedCleaned} orphaned transactions.`;
      setReconcileMessage(message);
      console.log('[AccountOverview] Reconciliation successful:', report);

      // Clear message after 5 seconds
      setTimeout(() => setReconcileMessage(null), 5000);
    } catch (error) {
      console.error('[AccountOverview] Reconciliation failed:', error);
      setReconcileMessage('❌ Reconciliation failed. Please check the console for details.');
      setTimeout(() => setReconcileMessage(null), 5000);
    } finally {
      setIsReconciling(false);
    }
  }, []);

  // Calculate summary statistics
  const totalBankBalance = accounts
    .filter(acc => acc.isActive)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
  const totalCreditBalance = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
  const totalAvailableCredit = totalCreditLimit - totalCreditBalance;
  const creditUtilization = calculateTotalCreditUtilization();
  const netWorth = calculateNetWorth();

  // Get active accounts by type
  const checkingAccounts = accounts.filter(acc => acc.accountType === 'checking' && acc.isActive);
  const savingsAccounts = accounts.filter(acc => acc.accountType === 'savings' && acc.isActive);
  const investmentAccounts = accounts.filter(acc => acc.type === 'bank' && !acc.accountType && acc.isActive);

  const checkingTotal = checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const investmentTotal = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Cards needing attention (high utilization or payment due soon)
  const highUtilizationCards = creditCards.filter(card => {
    const utilization = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
    return utilization > 80;
  });

  const today = new Date().getDate();
  const paymentDueCards = creditCards.filter(card => {
    const daysUntilPayment = card.paymentDate >= today ? card.paymentDate - today : (30 - today) + card.paymentDate;
    return daysUntilPayment <= 5;
  });

  return (
    <div className="space-y-6">
      {/* Reconciliation Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Data Integrity & Balance Reconciliation
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
              If you notice incorrect balances or inconsistencies, click below to automatically fix discrepancies,
              recalculate all account balances from transactions, and clean up orphaned data.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleReconcile}
                disabled={isReconciling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isReconciling
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
                {isReconciling ? 'Reconciling...' : 'Fix Balance Issues'}
              </button>

              {reconcileMessage && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  reconcileMessage.startsWith('✅')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {reconcileMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6" data-testid="net-worth-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium mb-1 opacity-90">Net Worth</h3>
          <p className="text-3xl font-bold">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-75 mt-1">Assets - Liabilities</p>
        </div>

        {/* Total Bank Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6" data-testid="total-bank-balance-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-75" />
          </div>
          <h3 className="text-sm font-medium mb-1 opacity-90">Total in Banks</h3>
          <p className="text-3xl font-bold">
            ${totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-75 mt-1">{accounts.filter(a => a.isActive).length} active accounts</p>
        </div>

        {/* Credit Card Debt */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6" data-testid="credit-card-debt-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <TrendingDown className="h-5 w-5 opacity-75" />
          </div>
          <h3 className="text-sm font-medium mb-1 opacity-90">Credit Card Debt</h3>
          <p className="text-3xl font-bold">
            ${totalCreditBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-75 mt-1">
            ${totalAvailableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available
          </p>
        </div>

        {/* Credit Utilization */}
        <div className={`bg-gradient-to-br ${
          creditUtilization > 80 ? 'from-red-500 to-red-600' :
          creditUtilization > 50 ? 'from-yellow-500 to-yellow-600' :
          'from-purple-500 to-purple-600'
        } text-white rounded-lg shadow-lg p-6`} data-testid="credit-utilization-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium mb-1 opacity-90">Credit Utilization</h3>
          <p className="text-3xl font-bold">
            {creditUtilization.toFixed(1)}%
          </p>
          <p className="text-xs opacity-75 mt-1">
            {creditUtilization > 30 ? 'Consider paying down' : 'Healthy level'}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {(highUtilizationCards.length > 0 || paymentDueCards.length > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Attention Needed</h3>
              <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {highUtilizationCards.map(card => (
                  <li key={card.id}>
                    • {card.bank} {card.cardName} has high utilization (
                    {((card.currentBalance / card.creditLimit) * 100).toFixed(1)}%)
                  </li>
                ))}
                {paymentDueCards.map(card => (
                  <li key={card.id}>
                    • {card.bank} {card.cardName} payment due on day {card.paymentDate}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Account Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Checking Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checking</h3>
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${checkingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {checkingAccounts.length} {checkingAccounts.length === 1 ? 'account' : 'accounts'}
          </p>
          {checkingAccounts.length > 0 && (
            <div className="mt-4 space-y-2">
              {checkingAccounts.map(acc => (
                <div key={acc.id} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{acc.bankName || acc.name}</span>
                  <span className="font-medium">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${savingsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {savingsAccounts.length} {savingsAccounts.length === 1 ? 'account' : 'accounts'}
          </p>
          {savingsAccounts.length > 0 && (
            <div className="mt-4 space-y-2">
              {savingsAccounts.map(acc => (
                <div key={acc.id} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{acc.bankName || acc.name}</span>
                  <span className="font-medium">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Investment Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investment</h3>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${investmentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {investmentAccounts.length} {investmentAccounts.length === 1 ? 'account' : 'accounts'}
          </p>
          {investmentAccounts.length > 0 && (
            <div className="mt-4 space-y-2">
              {investmentAccounts.map(acc => (
                <div key={acc.id} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{acc.bankName || acc.name}</span>
                  <span className="font-medium">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Accounts</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{accounts.filter(a => a.isActive).length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Credit Cards</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{creditCards.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Credit Limit</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ${totalCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg. Utilization</p>
            <p className={`text-xl font-bold ${
              creditUtilization > 80 ? 'text-red-600' :
              creditUtilization > 50 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {creditUtilization.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
