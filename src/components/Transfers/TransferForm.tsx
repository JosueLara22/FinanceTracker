import React, { useState, useEffect } from 'react';
import { useTransferStore } from '../../stores/useTransferStore';
import { useAccountStore } from '../../stores/useAccountStore';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface TransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, onCancel }) => {
  const { createTransfer, validateTransfer, isLoading, error: storeError } = useTransferStore();
  const { accounts, creditCards, loadAccounts, loadCreditCards } = useAccountStore();

  const [fromAccountId, setFromAccountId] = useState('');
  const [fromAccountType, setFromAccountType] = useState<'bank' | 'credit'>('bank');
  const [toAccountId, setToAccountId] = useState('');
  const [toAccountType, setToAccountType] = useState<'bank' | 'credit'>('bank');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadCreditCards();
  }, [loadAccounts, loadCreditCards]);

  const getSourceAccountOptions = () => {
    const bankOptions = accounts
      .filter(a => a.isActive)
      .map(a => ({
        value: a.id,
        label: `${a.bank} ****${a.accountNumber} (${formatCurrency(a.balance)})`,
        type: 'bank' as const,
        balance: a.balance,
      }));

    const creditOptions = creditCards.map(c => ({
      value: c.id,
      label: `${c.bank} ${c.cardName} (Available: ${formatCurrency(c.availableCredit)})`,
      type: 'credit' as const,
      balance: c.availableCredit,
    }));

    return [...bankOptions, ...creditOptions];
  };

  const getDestinationAccountOptions = () => {
    const bankOptions = accounts
      .filter(a => a.isActive && a.id !== fromAccountId)
      .map(a => ({
        value: a.id,
        label: `${a.bank} ****${a.accountNumber}`,
        type: 'bank' as const,
      }));

    const creditOptions = creditCards
      .filter(c => c.id !== fromAccountId)
      .map(c => ({
        value: c.id,
        label: `${c.bank} ${c.cardName} (Pay Balance)`,
        type: 'credit' as const,
      }));

    return [...bankOptions, ...creditOptions];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const handleSourceChange = (value: string) => {
    const option = getSourceAccountOptions().find(o => o.value === value);
    if (option) {
      setFromAccountId(value);
      setFromAccountType(option.type);
      setError('');
    }
  };

  const handleDestinationChange = (value: string) => {
    const option = getDestinationAccountOptions().find(o => o.value === value);
    if (option) {
      setToAccountId(value);
      setToAccountType(option.type);
      setError('');
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError('');

    if (fromAccountId && value) {
      const validation = validateTransfer(
        fromAccountId,
        fromAccountType,
        parseFloat(value)
      );
      if (!validation.valid) {
        setError(validation.error || '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!fromAccountId) {
      setError('Please select a source account');
      return;
    }

    if (!toAccountId) {
      setError('Please select a destination account');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    // Validate transfer
    const validation = validateTransfer(
      fromAccountId,
      fromAccountType,
      parseFloat(amount)
    );

    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    try {
      await createTransfer({
        fromAccountId,
        fromAccountType,
        toAccountId,
        toAccountType,
        amount: parseFloat(amount),
        fromCurrency: 'MXN',
        toCurrency: 'MXN',
        fee: fee ? parseFloat(fee) : undefined,
        date: new Date(date),
        description: description.trim(),
      });

      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setFromAccountId('');
        setToAccountId('');
        setAmount('');
        setFee('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Transfer</h2>

      {/* Error Message */}
      {(error || storeError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error || storeError}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Transfer created successfully!</p>
        </div>
      )}

      <div className="space-y-6">
        {/* From Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Account
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select source account</option>
            {getSourceAccountOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400" />
        </div>

        {/* To Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Account
          </label>
          <select
            value={toAccountId}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!fromAccountId}
          >
            <option value="">Select destination account</option>
            {getDestinationAccountOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Fee (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer Fee (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Credit card payment, Savings transfer"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Transfer Summary */}
        {fromAccountId && toAccountId && amount && parseFloat(amount) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Transfer Summary</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Amount to transfer: <span className="font-semibold">{formatCurrency(parseFloat(amount))}</span></p>
              {fee && parseFloat(fee) > 0 && (
                <p>Transfer fee: <span className="font-semibold">{formatCurrency(parseFloat(fee))}</span></p>
              )}
              <p className="pt-2 border-t border-blue-300">
                Total: <span className="font-semibold">{formatCurrency(parseFloat(amount) + (fee ? parseFloat(fee) : 0))}</span>
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Create Transfer'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
