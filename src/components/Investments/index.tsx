
import React, { useState } from 'react';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentList } from './InvestmentList';
import { useInvestments } from '../../hooks/useInvestments';

export const Investments: React.FC = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestments();
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <div className="p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Investments</h1>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary-DEFAULT text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
        >
          {isFormVisible ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-4">
          <InvestmentForm 
            onAddInvestment={(investment) => {
              addInvestment(investment);
              setIsFormVisible(false);
            }}
          />
        </div>
      )}

      <InvestmentList 
        investments={investments}
        onUpdateInvestment={updateInvestment}
        onDeleteInvestment={deleteInvestment}
      />
    </div>
  );
};
