import React, { useMemo } from 'react';
import { Income } from '../../types';
import { formatCurrency, formatMonthYear, formatPercentage } from '../../utils/formatters';
import { getMonthsAgo } from '../../utils/dateUtils';

interface IncomeReportsProps {
  incomes: Income[];
}

// Helper functions for income calculations
const calculateTotal = (incomes: Income[]): number => {
  return incomes.reduce((sum, income) => sum + income.amount, 0);
};

const calculateAverage = (incomes: Income[]): number => {
  return incomes.length > 0 ? calculateTotal(incomes) / incomes.length : 0;
};

const getCategoryTotals = (incomes: Income[]): Record<string, number> => {
  const totals: Record<string, number> = {};
  incomes.forEach(income => {
    totals[income.category] = (totals[income.category] || 0) + income.amount;
  });
  return totals;
};

const groupIncomesByMonth = (incomes: Income[]): Record<string, Income[]> => {
  const grouped: Record<string, Income[]> = {};
  incomes.forEach(income => {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(income);
  });
  return grouped;
};

const getUniqueSources = (incomes: Income[]): string[] => {
  const sources = new Set<string>();
  incomes.forEach(income => {
    if (income.source) {
      sources.add(income.source);
    }
  });
  return Array.from(sources).sort();
};

export const IncomeReports: React.FC<IncomeReportsProps> = ({ incomes }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = calculateTotal(incomes);
    const average = calculateAverage(incomes);
    const categoryTotals = getCategoryTotals(incomes);
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Group by source
    const sourceTotals: Record<string, number> = {};
    incomes.forEach(income => {
      sourceTotals[income.source] =
        (sourceTotals[income.source] || 0) + income.amount;
    });

    // Month-over-month comparison
    const currentMonthIncomes = incomes.filter(i => {
      const date = new Date(i.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const lastMonthIncomes = incomes.filter(i => {
      const date = new Date(i.date);
      const lastMonth = getMonthsAgo(1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    const currentMonthTotal = calculateTotal(currentMonthIncomes);
    const lastMonthTotal = calculateTotal(lastMonthIncomes);
    const monthOverMonthChange = lastMonthTotal > 0
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = getMonthsAgo(6);
    const recentIncomes = incomes.filter(i => new Date(i.date) >= sixMonthsAgo);
    const monthlyBreakdown = groupIncomesByMonth(recentIncomes);

    // Annual total
    const currentYear = new Date().getFullYear();
    const annualIncomes = incomes.filter(i => new Date(i.date).getFullYear() === currentYear);
    const annualTotal = calculateTotal(annualIncomes);

    return {
      total,
      average,
      count: incomes.length,
      categoryTotals: topCategories,
      sourceTotals: Object.entries(sourceTotals).sort(([, a], [, b]) => b - a),
      currentMonthTotal,
      lastMonthTotal,
      monthOverMonthChange,
      monthlyBreakdown,
      annualTotal
    };
  }, [incomes]);

  if (incomes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No hay datos suficientes para generar reportes
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Ingresos</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.total)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {stats.count} transacciones
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio por Ingreso</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.average)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Por transacción
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Este Mes</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.currentMonthTotal)}
          </p>
          <p className={`text-sm mt-1 ${
            stats.monthOverMonthChange > 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.monthOverMonthChange > 0 ? '↑' : '↓'} {formatPercentage(Math.abs(stats.monthOverMonthChange))} vs mes anterior
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Anual</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.annualTotal)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Año {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ingresos por Categoría
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
                    className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sources */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Por Fuente de Ingreso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.sourceTotals.map(([source, amount]) => {
            const percentage = (amount / stats.total) * 100;
            return (
              <div key={source} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {source}
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
            .map(([month, monthIncomes]) => {
              const total = calculateTotal(monthIncomes);
              const count = monthIncomes.length;
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
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
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
            <div className="text-sm text-gray-600 dark:text-gray-400">Ingreso Más Alto</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(Math.max(...incomes.map(i => i.amount)))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Ingreso Más Bajo</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(Math.min(...incomes.map(i => i.amount)))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">Fuentes de Ingreso</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
              {getUniqueSources(incomes).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
