import React, { useState, useEffect } from 'react';
import { Investment } from '../../types';
import { useAccountStore } from '../../stores/useAccountStore';

interface InvestmentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  onConfirmDelete: (investmentId: string, destinationAccountId?: string) => void;
}

export const InvestmentDeleteModal: React.FC<InvestmentDeleteModalProps> = ({
  isOpen,
  onClose,
  investment,
  onConfirmDelete,
}) => {
  const { accounts, loadAccounts } = useAccountStore();
  const [transferFunds, setTransferFunds] = useState(false);
  const [destinationAccountId, setDestinationAccountId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setTransferFunds(false); // Reset state when modal opens
      setDestinationAccountId(undefined); // Reset state when modal opens
    }
  }, [isOpen, loadAccounts]);

  if (!isOpen || !investment) {
    return null;
  }

  const bankAccounts = accounts.filter(acc => acc.type === 'bank');

  const handleConfirm = () => {
    if (investment) {
      onConfirmDelete(investment.id, transferFunds ? destinationAccountId : undefined);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-1/3">
        <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Delete Investment: {investment.platform}</h3>
        <p className="mb-4 dark:text-gray-300">
          Are you sure you want to delete this investment? This action will soft-delete the investment and its related records.
        </p>
        <p className="mb-4 dark:text-gray-300">
          Current Value: <span className="font-bold text-success">{formatCurrency(investment.currentValue)}</span>
        </p>

        <div className="mb-4">
          <label className="inline-flex items-center dark:text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={transferFunds}
              onChange={(e) => setTransferFunds(e.target.checked)}
            />
            <span className="ml-2">Transfer current value to another account</span>
          </label>
        </div>

        {transferFunds && (
          <div className="mb-4">
            <label htmlFor="destinationAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination Account:
            </label>
            <select
              id="destinationAccount"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={destinationAccountId || ''}
              onChange={(e) => setDestinationAccountId(e.target.value || undefined)}
            >
              <option value="">Select an account</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bankName} (****{account.accountNumber})
                </option>
              ))}
            </select>
            {transferFunds && !destinationAccountId && (
              <p className="text-danger text-sm mt-1">Please select a destination account to transfer funds.</p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              transferFunds && !destinationAccountId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-danger hover:bg-red-700'
            }`}
            disabled={transferFunds && !destinationAccountId}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
