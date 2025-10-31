import React, { useState } from 'react';
import { Investment } from '../../types';

interface InvestmentFormProps {
  onAddInvestment: (investment: Omit<Investment, 'id'>) => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onAddInvestment }) => {
  const [platform, setPlatform] = useState<'Nu' | 'Didi' | 'MercadoPago' | 'Other'>('Nu');
  const [type, setType] = useState('Cajita');
  const [initialCapital, setInitialCapital] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [gatPercentage, setGatPercentage] = useState('');
  const [autoReinvest, setAutoReinvest] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !initialCapital || !startDate || !gatPercentage) {
      alert('Please fill out all required fields.');
      return;
    }

    const capital = parseFloat(initialCapital);
    const gat = parseFloat(gatPercentage);

    // Per spec, some fields are calculated
    const dailyReturn = (capital * (gat / 100)) / 365;
    const now = new Date();

    onAddInvestment({
      platform,
      type,
      initialCapital: capital,
      startDate: new Date(startDate),
      gatPercentage: gat,
      dailyReturn,
      accumulatedReturns: 0, // Will be calculated over time
      currentValue: capital, // Starts with initial capital
      lastUpdate: now,
      autoReinvest,
    });

    // Reset form
    setPlatform('Nu');
    setType('Cajita');
    setInitialCapital('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setGatPercentage('');
    setAutoReinvest(true);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as 'Nu' | 'Didi' | 'MercadoPago' | 'Other')}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <option value="Nu">Nu</option>
          <option value="Didi">Didi</option>
          <option value="MercadoPago">MercadoPago</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Type (e.g., Cajita, Inversión)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
        <input
          type="number"
          placeholder="Initial Capital (MXN)"
          value={initialCapital}
          onChange={(e) => setInitialCapital(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
        <input
          type="number"
          step="0.01"
          placeholder="GAT % (Annual)"
          value={gatPercentage}
          onChange={(e) => setGatPercentage(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoReinvest"
            checked={autoReinvest}
            onChange={(e) => setAutoReinvest(e.target.checked)}
            className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="autoReinvest" className="dark:text-gray-300">Auto-reinvest?</label>
        </div>
      </div>
      <button type="submit" className="mt-4 w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 dark:hover:bg-purple-800">
        Add Investment
      </button>
    </form>
  );
};