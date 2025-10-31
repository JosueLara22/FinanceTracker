import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountStore } from '../../stores/useAccountStore';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { TransactionList } from '../Transactions/TransactionList';
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  CreditCard as CreditCardIcon,
  Building,
  AlertCircle
} from 'lucide-react';

interface AccountDetailProps {
  type: 'bank' | 'credit';
}

export const AccountDetail: React.FC<AccountDetailProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    accounts,
    creditCards,
    getAccountById,
    getCreditCardById,
    deleteAccount,
    deleteCreditCard,
    loadAccounts,
    loadCreditCards
  } = useAccountStore();
  const { getTransactionsByAccountId, loadTransactions } = useTransactionStore();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (type === 'bank') {
      loadAccounts();
    } else {
      loadCreditCards();
    }
    loadTransactions();
  }, [type, loadAccounts, loadCreditCards, loadTransactions]);

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">Account ID not provided</p>
        </div>
      </div>
    );
  }

  const account = type === 'bank' ? getAccountById(id) : undefined;
  const creditCard = type === 'credit' ? getCreditCardById(id) : undefined;

  if (!account && !creditCard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">Account not found</p>
        </div>
      </div>
    );
  }

  const transactions = getTransactionsByAccountId(id);
  const totalIn = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleDelete = async () => {
    try {
      if (type === 'bank' && account) {
        await deleteAccount(account.id);
      } else if (type === 'credit' && creditCard) {
        await deleteCreditCard(creditCard.id);
      }
      navigate('/accounts');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/accounts')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Accounts
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {type === 'bank'
                ? `${account!.bank} Account`
                : `${creditCard!.bank} ${creditCard!.cardName}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {type === 'bank'
                ? `****${account!.accountNumber} • ${account!.accountType}`
                : `****${creditCard!.lastFourDigits}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/accounts/${type}/${id}/edit`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Account"
            >
              <Edit className="w-5 h-5" />
            </button>
            {deleteConfirm ? (
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-red-900">Delete?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Account"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {type === 'bank' ? (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Current Balance</p>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(account!.balance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{account!.currency}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Account Type</p>
                <Building className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {account!.accountType}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {account!.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Current Balance</p>
                <CreditCardIcon className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(creditCard!.currentBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Amount Owed</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Available Credit</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(creditCard!.availableCredit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of {formatCurrency(creditCard!.creditLimit)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Utilization</p>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((creditCard!.currentBalance / creditCard!.creditLimit) * 100).toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (creditCard!.currentBalance / creditCard!.creditLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Last Updated</p>
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(type === 'bank' ? account!.lastUpdate : new Date())}
          </p>
        </div>
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-800 font-medium">Total In</p>
            <TrendingUp className="w-5 h-5 text-green-700" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(totalIn)}
          </p>
          <p className="text-xs text-green-700 mt-1">
            {transactions.filter(t => t.amount > 0).length} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-800 font-medium">Total Out</p>
            <TrendingDown className="w-5 h-5 text-red-700" />
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(totalOut)}
          </p>
          <p className="text-xs text-red-700 mt-1">
            {transactions.filter(t => t.amount < 0).length} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-800 font-medium">Net Flow</p>
            <DollarSign className="w-5 h-5 text-blue-700" />
          </div>
          <p className={`text-2xl font-bold ${totalIn - totalOut >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(totalIn - totalOut)}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {transactions.length} total transactions
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
        <TransactionList accountId={id} />
      </div>
    </div>
  );
};
