import React, { useMemo } from 'react';
import { Expense } from '../../types';
import { formatCurrency, formatMonthYear, formatPercentage } from '../../utils/formatters';
import {
  getCategoryTotals,
  calculateTotal,
  calculateAverage,
  groupExpensesByMonth,
  getUniquePaymentMethods
} from '../../utils/filters';
import { getMonthsAgo } from '../../utils/dateUtils';
import { exportExpensesToCSV, exportExpensesToJSON } from '../../utils/export';

interface ExpenseReportsProps {
  expenses: Expense[];
}

export const ExpenseReports: React.FC<ExpenseReportsProps> = ({ expenses }) => {
  const handleExportCSV = () => {
    exportExpensesToCSV(expenses);
  };

  const handleExportJSON = () => {
    exportExpensesToJSON(expenses);
  };
  // Calculate statistics
  const stats = useMemo(() => {
    const total = calculateTotal(expenses);
    const average = calculateAverage(expenses);
    const categoryTotals = getCategoryTotals(expenses);
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Group by payment method
    const paymentMethodTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      paymentMethodTotals[expense.paymentMethod] =
        (paymentMethodTotals[expense.paymentMethod] || 0) + expense.amount;
    });

    // Month-over-month comparison
    const currentMonthExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const lastMonthExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      const lastMonth = getMonthsAgo(1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    const currentMonthTotal = calculateTotal(currentMonthExpenses);
    const lastMonthTotal = calculateTotal(lastMonthExpenses);
    const monthOverMonthChange = lastMonthTotal > 0
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = getMonthsAgo(6);
    const recentExpenses = expenses.filter(e => new Date(e.date) >= sixMonthsAgo);
    const monthlyBreakdown = groupExpensesByMonth(recentExpenses);

    return {
      total,
      average,
      count: expenses.length,
      categoryTotals: topCategories,
      paymentMethodTotals: Object.entries(paymentMethodTotals).sort(([, a], [, b]) => b - a),
      currentMonthTotal,
      lastMonthTotal,
      monthOverMonthChange,
      monthlyBreakdown
    };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No hay datos suficientes para generar reportes
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium transition-colors"
        >
          Exportar a CSV
        </button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm font-medium transition-colors"
        >
          Exportar a JSON
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Gastos</h3>
          <p className="text-3xl font-bold text-primary-DEFAULT dark:text-primary-light mt-2">
            {formatCurrency(stats.total)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {stats.count} transacciones
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio por Gasto</h3>
          <p className="text-3xl font-bold text-primary-DEFAULT dark:text-primary-light mt-2">
            {formatCurrency(stats.average)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Por transacción
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Este Mes</h3>
          <p className="text-3xl font-bold text-primary-DEFAULT dark:text-primary-light mt-2">
            {formatCurrency(stats.currentMonthTotal)}
          </p>
          <p className={`text-sm mt-1 ${
            stats.monthOverMonthChange > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}>
            {stats.monthOverMonthChange > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(stats.monthOverMonthChange))} vs mes anterior
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Mes Anterior</h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
            {formatCurrency(stats.lastMonthTotal)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Comparación
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 5 Categorías
        </h3>
        <div className="space-y-4">
          {stats.categoryTotals.map(([category, amount]) => {
            const percentage = (amount / stats.total) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(amount)} ({formatPercentage(percentage)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-DEFAULT dark:bg-primary-light h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Por Método de Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.paymentMethodTotals.map(([method, amount]) => {
            const percentage = (amount / stats.total) * 100;
            return (
              <div key={method} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {method}
                </span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(amount)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPercentage(percentage)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Últimos 6 Meses
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.monthlyBreakdown)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, monthExpenses]) => {
              const total = calculateTotal(monthExpenses);
              const count = monthExpenses.length;
              const monthDate = new Date(month + '-01');

              return (
                <div key={month} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatMonthYear(monthDate)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {count} transacciones
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Promedio: {formatCurrency(total / count)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estadísticas Adicionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Gasto Más Alto</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(Math.max(...expenses.map(e => e.amount)))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Gasto Más Bajo</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(Math.min(...expenses.map(e => e.amount)))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Métodos de Pago Usados</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {getUniquePaymentMethods(expenses).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
