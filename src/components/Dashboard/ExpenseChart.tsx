import React, { useMemo } from 'react';
import { Expense } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseChartProps {
  expenses: Expense[];
}

const formatCurrencyForAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
        return `${(tickItem / 1000).toFixed(0)}k`;
    }
    return tickItem.toString();
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const chartData = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTotals: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        monthlyTotals[monthKey] = 0;
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= sixMonthsAgo) {
        const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
        if(monthlyTotals[monthKey] !== undefined) {
            monthlyTotals[monthKey] += expense.amount;
        }
      }
    });

    return Object.keys(monthlyTotals).map(month => ({
      month,
      amount: monthlyTotals[month],
    }));
  }, [expenses]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatCurrencyForAxis} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} />
        <Legend />
        <Line type="monotone" dataKey="amount" name="Gastos Totales" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};