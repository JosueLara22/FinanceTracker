import React, { useState, useEffect } from 'react';
import { useAccountStore } from '../../stores';
import { CreditCard } from '../../types';

interface CreditCardFormProps {
  onClose: () => void;
  cardToEdit?: CreditCard | null;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ onClose, cardToEdit }) => {
  const { addCreditCard, updateCreditCard } = useAccountStore();

  const [bank, setBank] = useState('');
  const [cardName, setCardName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [cutoffDate, setCutoffDate] = useState<number>(1);
  const [paymentDate, setPaymentDate] = useState<number>(1);
  const [interestRate, setInterestRate] = useState<number>(0);

  // Load existing credit card data if editing
  useEffect(() => {
    if (cardToEdit) {
      setBank(cardToEdit.bank);
      setCardName(cardToEdit.cardName);
      setLastFourDigits(cardToEdit.lastFourDigits);
      setCreditLimit(cardToEdit.creditLimit);
      setCurrentBalance(cardToEdit.currentBalance);
      setCutoffDate(cardToEdit.cutoffDate);
      setPaymentDate(cardToEdit.paymentDate);
      setInterestRate(cardToEdit.interestRate);
    }
  }, [cardToEdit]);

  const availableCredit = creditLimit - currentBalance;
  const utilizationPercentage = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bank || !cardName || !lastFourDigits || creditLimit <= 0) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (lastFourDigits.length !== 4 || !/^\d+$/.test(lastFourDigits)) {
      alert('Last four digits must be exactly 4 numeric characters.');
      return;
    }

    if (currentBalance > creditLimit) {
      alert('Current balance cannot exceed credit limit.');
      return;
    }

    if (cutoffDate < 1 || cutoffDate > 31 || paymentDate < 1 || paymentDate > 31) {
      alert('Cutoff date and payment date must be between 1 and 31.');
      return;
    }

    const cardData = {
      bank,
      cardName,
      lastFourDigits,
      creditLimit,
      currentBalance,
      availableCredit,
      cutoffDate,
      paymentDate,
      interestRate,
    };

    try {
      if (cardToEdit) {
        await updateCreditCard(cardToEdit.id, cardData);
      } else {
        await addCreditCard(cardData);
      }
      onClose();
    } catch (error) {
      alert('Failed to save credit card. Please try again.');
      console.error('Error saving credit card:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="credit-card-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bank Name *
          </label>
          <input
            type="text"
            id="bank"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., BBVA, Santander"
            required
          />
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Card Name *
          </label>
          <input
            type="text"
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Platinum, Gold"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="lastFourDigits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Last 4 Digits *
        </label>
        <input
          type="text"
          id="lastFourDigits"
          value={lastFourDigits}
          onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="1234"
          maxLength={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Credit Limit *
          </label>
          <input
            type="number"
            id="creditLimit"
            value={creditLimit}
            onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Balance
          </label>
          <input
            type="number"
            id="currentBalance"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            step="0.01"
          />
        </div>
      </div>

      {/* Utilization Display */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Available Credit:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
          <span className={`font-semibold ${
            utilizationPercentage > 80 ? 'text-red-600' :
            utilizationPercentage > 50 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {utilizationPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              utilizationPercentage > 80 ? 'bg-red-600' :
              utilizationPercentage > 50 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            data-testid="utilization-bar"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cutoffDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cutoff Date (Day of Month)
          </label>
          <input
            type="number"
            id="cutoffDate"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(parseInt(e.target.value) || 1)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            max="31"
          />
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Date (Day of Month)
          </label>
          <input
            type="number"
            id="paymentDate"
            value={paymentDate}
            onChange={(e) => setPaymentDate(parseInt(e.target.value) || 1)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            max="31"
          />
        </div>
      </div>

      <div>
        <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Interest Rate (Annual %)
        </label>
        <input
          type="number"
          id="interestRate"
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-DEFAULT focus:ring-primary-DEFAULT dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          step="0.01"
          min="0"
          max="100"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          data-testid="submit-button"
        >
          {cardToEdit ? 'Update Card' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};
