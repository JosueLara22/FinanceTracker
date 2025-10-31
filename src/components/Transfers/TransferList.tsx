import React, { useState, useEffect } from 'react';
import { Transfer } from '../../types';
import { useTransferStore } from '../../stores/useTransferStore';
import { useAccountStore } from '../../stores/useAccountStore';
import {
  ArrowRight,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Trash2
} from 'lucide-react';

interface TransferListProps {
  accountId?: string; // Optional: filter by account
  limit?: number; // Optional: limit number shown
}

export const TransferList: React.FC<TransferListProps> = ({ accountId, limit }) => {
  const { transfers, loadTransfers, deleteTransfer, getTransfersByAccountId } = useTransferStore();
  const { accounts, creditCards } = useAccountStore();
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  useEffect(() => {
    let result = accountId
      ? getTransfersByAccountId(accountId)
      : transfers;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
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

    setFilteredTransfers(result);
  }, [transfers, accountId, searchTerm, statusFilter, startDate, endDate, limit, getTransfersByAccountId]);

  const getAccountName = (accountId: string, accountType: 'bank' | 'credit'): string => {
    if (accountType === 'bank') {
      const account = accounts.find(a => a.id === accountId);
      return account ? `${account.bank} ****${account.accountNumber}` : 'Unknown Account';
    } else {
      const card = creditCards.find(c => c.id === accountId);
      return card ? `${card.bank} ${card.cardName}` : 'Unknown Card';
    }
  };

  const getStatusIcon = (status: Transfer['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Transfer['status']) => {
    const classes = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${classes[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransfer(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete transfer:', error);
    }
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
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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

      {/* Transfer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transfers found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'all' || startDate || endDate
                ? 'Try adjusting your filters'
                : 'Transfers will appear here once you create them'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(transfer.status)}
                    </div>

                    {/* Transfer Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {transfer.description}
                        </p>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(transfer.status)}
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transfer.amount)}
                          </p>
                        </div>
                      </div>

                      {/* From/To Accounts */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <span className="bg-blue-50 px-2 py-0.5 rounded">
                          {getAccountName(transfer.fromAccountId, transfer.fromAccountType)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="bg-green-50 px-2 py-0.5 rounded">
                          {getAccountName(transfer.toAccountId, transfer.toAccountType)}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(transfer.date)}
                        </span>
                        {transfer.fee && transfer.fee > 0 && (
                          <span>Fee: {formatCurrency(transfer.fee)}</span>
                        )}
                        {transfer.exchangeRate && (
                          <span>Rate: {transfer.exchangeRate.toFixed(4)}</span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    {transfer.status !== 'completed' && (
                      <div className="flex-shrink-0">
                        {deleteConfirm === transfer.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Delete?</span>
                            <button
                              onClick={() => handleDelete(transfer.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(transfer.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete transfer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTransfers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Transfers</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredTransfers.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(
                  filteredTransfers.reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Fees</p>
              <p className="text-lg font-semibold text-gray-600">
                {formatCurrency(
                  filteredTransfers.reduce((sum, t) => sum + (t.fee || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
