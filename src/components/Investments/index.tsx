
import React, { useState } from 'react';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentList } from './InvestmentList';
import { InvestmentComparison } from './InvestmentComparison';
import { InvestmentMigrationPrompt } from './InvestmentMigrationPrompt';
import { useInvestmentStore } from '../../stores/useInvestmentStore';

export const Investments: React.FC = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestmentStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'comparison'>('list');

  return (
    <div className="p-4 mt-6">
      {/* Migration prompt for existing investments */}
      <InvestmentMigrationPrompt />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-gray-300">Investments</h1>
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
            onAddInvestment={async (investment, sourceAccountId) => {
              const result = await addInvestment(investment, sourceAccountId);
              if (result.success) {
                setIsFormVisible(false);
              }
              return result;
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-primary-DEFAULT text-primary-DEFAULT'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Investments ({investments.length})
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-primary-DEFAULT text-primary-DEFAULT'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Platform Comparison
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <InvestmentList
          investments={investments}
          onUpdateInvestment={updateInvestment}
          onDeleteInvestment={deleteInvestment}
        />
      ) : (
        <InvestmentComparison investments={investments} />
      )}
    </div>
  );
};
