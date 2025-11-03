import React, { useState } from 'react';
import { useAccountStore } from '../../stores';
import { AccountList } from './AccountList';
import { AccountForm } from './AccountForm';
import { CreditCardList } from './CreditCardList';
import { CreditCardForm } from './CreditCardForm';
import { AccountOverview } from './AccountOverview';
import { BankAccount, CreditCard } from '../../types';
import { LayoutDashboard, Wallet, CreditCard as CreditCardIcon } from 'lucide-react';

type TabType = 'overview' | 'accounts' | 'cards';

export const Accounts: React.FC = () => {
  const { accounts, creditCards, deleteAccount, deleteCreditCard } = useAccountStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isCreditCardFormOpen, setIsCreditCardFormOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
  const [cardToEdit, setCardToEdit] = useState<CreditCard | null>(null);

  // Bank Account handlers
  const handleAddAccount = () => {
    setAccountToEdit(null);
    setIsAccountFormOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setAccountToEdit(account);
    setIsAccountFormOpen(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        alert('No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleCloseAccountForm = () => {
    setIsAccountFormOpen(false);
    setAccountToEdit(null);
  };

  // Credit Card handlers
  const handleAddCreditCard = () => {
    setCardToEdit(null);
    setIsCreditCardFormOpen(true);
  };

  const handleEditCreditCard = (card: CreditCard) => {
    setCardToEdit(card);
    setIsCreditCardFormOpen(true);
  };

  const handleDeleteCreditCard = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta de crédito? Esta acción no se puede deshacer.')) {
      try {
        await deleteCreditCard(id);
      } catch (error) {
        alert('No se pudo eliminar la tarjeta de crédito. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleCloseCreditCardForm = () => {
    setIsCreditCardFormOpen(false);
    setCardToEdit(null);
  };

  const tabs = [
    { id: 'overview' as TabType, name: 'Resumen', icon: LayoutDashboard },
    { id: 'accounts' as TabType, name: 'Cuentas Bancarias', icon: Wallet },
    { id: 'cards' as TabType, name: 'Tarjetas de Crédito', icon: CreditCardIcon },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cuentas Financieras</h2>

        {activeTab === 'accounts' && (
          <button
            onClick={handleAddAccount}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          >
            Agregar Cuenta Bancaria
          </button>
        )}

        {activeTab === 'cards' && (
          <button
            onClick={handleAddCreditCard}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT"
          >
            Agregar Tarjeta de Crédito
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-primary-DEFAULT text-primary-DEFAULT'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${isActive ? 'text-primary-DEFAULT' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <AccountOverview />}

        {activeTab === 'accounts' && (
          <AccountList
            accounts={accounts}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'cards' && (
          <CreditCardList
            creditCards={creditCards}
            onEditCard={handleEditCreditCard}
            onDeleteCard={handleDeleteCreditCard}
          />
        )}
      </div>

      {/* Bank Account Form Modal */}
      {isAccountFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {accountToEdit ? 'Editar Cuenta Bancaria' : 'Agregar Nueva Cuenta Bancaria'}
            </h3>
            <AccountForm
              onClose={handleCloseAccountForm}
              accountToEdit={accountToEdit}
            />
          </div>
        </div>
      )}

      {/* Credit Card Form Modal */}
      {isCreditCardFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {cardToEdit ? 'Editar Tarjeta de Crédito' : 'Agregar Nueva Tarjeta de Crédito'}
            </h3>
            <CreditCardForm
              onClose={handleCloseCreditCardForm}
              cardToEdit={cardToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};