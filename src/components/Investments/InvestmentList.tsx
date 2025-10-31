import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { Investment } from '../../types';

const InvestmentCard = ({ investment }: { investment: Investment }) => {
  const roi = ((investment.currentValue - investment.initialCapital) / investment.initialCapital) * 100;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-bold text-lg text-primary">{investment.platform}</h4>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>
          <p className="text-gray-500">Capital Inicial</p>
          <p className="font-semibold">${investment.initialCapital.toLocaleString('es-MX')}</p>
        </div>
        <div>
          <p className="text-gray-500">Valor Actual</p>
          <p className="font-semibold text-green-600">${investment.currentValue.toLocaleString('es-MX')}</p>
        </div>
        <div>
          <p className="text-gray-500">GAT Anual</p>
          <p className="font-semibold">{investment.gatPercentage.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-gray-500">ROI</p>
          <p className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{roi.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-gray-500">Rendimiento Diario</p>
          <p className="font-semibold">${investment.dailyReturn.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const InvestmentList = () => {
  const investments = useLiveQuery(() => db.investments.toArray());

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis Inversiones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investments && investments.length > 0 ? (
          investments.map(investment => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 md:col-span-2">No hay inversiones registradas todavía.</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentList;
