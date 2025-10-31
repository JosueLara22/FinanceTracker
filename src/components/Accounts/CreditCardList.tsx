import React from 'react';
import { CreditCard } from '../../types';
import { CreditCard as CreditCardIcon, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

interface CreditCardListProps {
  creditCards: CreditCard[];
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
}

export const CreditCardList: React.FC<CreditCardListProps> = ({ creditCards, onEditCard, onDeleteCard }) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-600';
    if (percentage > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-600';
    if (percentage > 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const calculateUtilization = (card: CreditCard) => {
    return card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
  };

  const calculateMinimumPayment = (balance: number) => {
    // Typically 2.5% of balance or $200 MXN, whichever is greater
    return Math.max(balance * 0.025, 200);
  };

  const isPaymentDueSoon = (paymentDate: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    // Warning if payment is within 5 days
    if (paymentDate >= currentDay && paymentDate <= currentDay + 5) {
      return true;
    }
    // Handle month wrap-around
    if (currentDay > 25 && paymentDate <= 5) {
      return true;
    }
    return false;
  };

  if (creditCards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCardIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No credit cards added yet.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Add your first credit card to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="credit-card-list">
      {creditCards.map((card) => {
        const utilization = calculateUtilization(card);
        const minimumPayment = calculateMinimumPayment(card.currentBalance);
        const paymentDueSoon = isPaymentDueSoon(card.paymentDate);

        return (
          <div
            key={card.id}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white shadow-xl rounded-xl p-6"
            data-testid={`credit-card-card-${card.id}`}>

            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-full bg-blue-200 dark:bg-white/10">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              {paymentDueSoon && (
                <span className="flex items-center px-2 py-1 text-xs font-semibold text-red-100 bg-red-600 rounded-full">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Due Soon
                </span>
              )}
            </div>

            {/* Card Info */}
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{card.bank}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{card.cardName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">•••• •••• •••• {card.lastFourDigits}</p>
            </div>

            {/* Current Balance */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
              <p className="text-2xl font-bold" data-testid={`credit-card-balance-${card.id}`}>
                ${card.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of ${card.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} limit
              </p>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 dark:text-gray-400">Credit Utilization</span>
                <span className={getUtilizationColor(utilization)} data-testid={`credit-card-utilization-${card.id}`}>
                  {utilization.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUtilizationBgColor(utilization)}`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>

            {/* Available Credit */}
            <div className="mb-4 p-3 bg-blue-200/50 dark:bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Credit</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${card.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2 bg-blue-200/50 dark:bg-white/5 rounded">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Cutoff</span>
                </div>
                <p className="font-semibold">Day {card.cutoffDate}</p>
              </div>
              <div className="p-2 bg-blue-200/50 dark:bg-white/5 rounded">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Payment</span>
                </div>
                <p className="font-semibold">Day {card.paymentDate}</p>
              </div>
            </div>

            {/* Minimum Payment Warning */}
            {card.currentBalance > 0 && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 dark:bg-yellow-500/10 dark:border-yellow-500/20 rounded-lg">
                <div className="flex items-center text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Minimum Payment</span>
                </div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  ${minimumPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* Interest Rate */}
            {card.interestRate > 0 && (
              <div className="mb-4 flex items-center justify-between text-xs p-2 bg-blue-200/50 dark:bg-white/5 rounded">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>Interest Rate</span>
                </div>
                <span className="font-semibold">{card.interestRate.toFixed(2)}%</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={() => onEditCard(card)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 rounded-md text-sm font-medium transition-colors"
                data-testid={`edit-credit-card-${card.id}`}>
                Edit
              </button>
              <button
                onClick={() => onDeleteCard(card.id)}
                className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-600/20 dark:hover:bg-red-600/30 dark:text-red-300 rounded-md text-sm font-medium transition-colors"
                data-testid={`delete-credit-card-${card.id}`}>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
