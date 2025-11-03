import React, { useState, useEffect } from 'react';
import { TransferForm } from './TransferForm';
import { TransferList } from './TransferList';
import { useTransferStore } from '../../stores/useTransferStore';
import { Plus } from 'lucide-react';

export const Transfers: React.FC = () => {
  const { loadTransfers } = useTransferStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Transferencia
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <TransferForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <TransferList />
    </div>
  );
};

export { TransferForm, TransferList };
