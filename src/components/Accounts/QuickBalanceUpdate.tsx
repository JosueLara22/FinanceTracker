import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { RefreshCw } from 'lucide-react';

interface QuickBalanceUpdateProps {
  account: BankAccount;
  onUpdate: (id: string, newBalance: number) => void;
}

export const QuickBalanceUpdate: React.FC<QuickBalanceUpdateProps> = ({ account, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(account.balance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(account.id, newBalance);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewBalance(account.balance);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        title="Quick update balance"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Update</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="number"
        value={newBalance}
        onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
        step="0.01"
        className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        autoFocus
      />
      <button
        type="submit"
        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
      >
        Save
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
      >
        Cancel
      </button>
    </form>
  );
};
