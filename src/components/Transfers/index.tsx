import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TransferForm } from './TransferForm';
import { TransferList } from './TransferList';
import { useTransferStore } from '../../stores/useTransferStore';
import { CreditCard } from '../../types';
import { Plus } from 'lucide-react';

export const Transfers: React.FC = () => {
  const { loadTransfers } = useTransferStore();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [initialToCreditCard, setInitialToCreditCard] = useState<CreditCard | undefined>();

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  useEffect(() => {
    // Check if we have a pre-selected credit card from navigation state
    const state = location.state as { toCreditCard?: CreditCard };
    if (state?.toCreditCard) {
      setInitialToCreditCard(state.toCreditCard);
      setShowForm(true);
      // Clear the state so it doesn't persist on navigation
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transferencias</h1>
          <p className="text-gray-600 mt-2">
            Transfiere dinero entre tus cuentas y tarjetas de crédito
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Transferencia
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <TransferForm
            onSuccess={() => {
              setShowForm(false);
              setInitialToCreditCard(undefined);
            }}
            onCancel={() => {
              setShowForm(false);
              setInitialToCreditCard(undefined);
            }}
            initialToCreditCard={initialToCreditCard}
          />
        </div>
      )}

      <TransferList />
    </div>
  );
};

export { TransferForm, TransferList };
