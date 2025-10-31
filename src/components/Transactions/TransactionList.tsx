import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Transaction } from '../../types';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { useAccountStore } from '../../stores/useAccountStore';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface TransactionListProps {
  accountId?: string; // Optional: filter by account
  limit?: number; // Optional: limit number of transactions shown
}

export const TransactionList: React.FC<TransactionListProps> = ({ accountId, limit }) => {
  const { transactions, loadTransactions, getTransactionsByAccountId } = useTransactionStore();
  const { accounts, creditCards } = useAccountStore();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    let result = accountId
      ? getTransactionsByAccountId(accountId)
      : transactions;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Filter by date range
    if (startDate) {
      result = result.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(t => new Date(t.date) <= new Date(endDate));
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit if specified
    if (limit) {
      result = result.slice(0, limit);
    }

    setFilteredTransactions(result);
  }, [transactions, accountId, searchTerm, filterType, startDate, endDate, limit, getTransactionsByAccountId]);

  const getAccountName = (transaction: Transaction): string => {
    if (transaction.accountType === 'bank') {
      const account = accounts.find(a => a.id === transaction.accountId);
      return account ? `${account.bank} ****${account.accountNumber}` : 'Unknown Account';
    } else {
      const card = creditCards.find(c => c.id === transaction.accountId);
      return card ? `${card.bank} ${card.cardName}` : 'Unknown Card';
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
      case 'charge':
        return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Transfers</option>
              <option value="payment">Payments</option>
              <option value="charge">Charges</option>
              <option value="refund">Refunds</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || filterType !== 'all' || startDate || endDate
                ? 'Try adjusting your filters'
                : 'Transactions will appear here once you create them'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.expenseId ? (
                            <Link to={`/expenses/${transaction.expenseId}`} className="hover:underline">
                              {transaction.description}
                            </Link>
                          ) : transaction.incomeId ? (
                            <Link to={`/incomes/${transaction.incomeId}`} className="hover:underline">
                              {transaction.description}
                            </Link>
                          ) : (
                            transaction.description
                          )}
                        </p>
                        <p className={`text-sm font-semibold ml-4 ${getAmountColor(transaction.amount)}`}>
                          {transaction.amount >= 0 ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(transaction.date)}
                        </span>
                        <span className="capitalize">{transaction.type}</span>
                        {transaction.category && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {transaction.category}
                          </span>
                        )}
                        {!accountId && (
                          <span className="text-gray-400">
                            {getAccountName(transaction)}
                          </span>
                        )}
                        {transaction.pending && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  {accountId && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.balance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total In</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Out</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(
                  Math.abs(
                    filteredTransactions
                      .filter(t => t.amount < 0)
                      .reduce((sum, t) => sum + t.amount, 0)
                  )
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Net</p>
              <p className={`text-lg font-semibold ${getAmountColor(
                filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
              )}`}>
                {formatCurrency(
                  filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
