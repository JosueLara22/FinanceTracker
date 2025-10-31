import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Investment } from '../../types';

const InvestmentForm = () => {
  const { addInvestment } = useAppContext(); // This will be added to the context
  const [platform, setPlatform] = useState<'Nu' | 'Didi' | 'MercadoPago' | 'Other'>('Nu');
  const [initialCapital, setInitialCapital] = useState('');
  const [gatPercentage, setGatPercentage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialCapital || !gatPercentage) {
      alert('Please fill all fields');
      return;
    }

    const capital = parseFloat(initialCapital);
    const gat = parseFloat(gatPercentage);

    const newInvestment: Omit<Investment, 'id'> = {
      platform,
      type: 'Cajita', // Default type for now
      initialCapital: capital,
      startDate: new Date(),
      gatPercentage: gat,
      dailyReturn: (capital * (gat / 100)) / 365,
      accumulatedReturns: 0,
      currentValue: capital,
      lastUpdate: new Date(),
      autoReinvest: true,
    };

    await addInvestment(newInvestment);

    // Reset form
    setInitialCapital('');
    setGatPercentage('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Agregar Nueva Inversión</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select 
          value={platform} 
          onChange={e => setPlatform(e.target.value as any)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Nu">Nu</option>
          <option value="Didi">Didi</option>
          <option value="MercadoPago">MercadoPago</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          placeholder="Capital Inicial (e.g., 10000)"
          value={initialCapital}
          onChange={(e) => setInitialCapital(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="number"
          step="0.01"
          placeholder="GAT Anual % (e.g., 15.00)"
          value={gatPercentage}
          onChange={(e) => setGatPercentage(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button type="submit" className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        + Agregar Inversión
      </button>
    </form>
  );
};

export default InvestmentForm;
