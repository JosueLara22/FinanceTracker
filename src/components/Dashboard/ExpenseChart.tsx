import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subMonths, format, startOfMonth } from 'date-fns';

const ExpenseChart = () => {
  const expenses = useLiveQuery(() => db.expenses.toArray());

  const processData = () => {
    if (!expenses) return [];

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const monthlyTotals: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const month = format(subMonths(new Date(), i), 'yyyy-MM');
      monthlyTotals[month] = 0;
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= sixMonthsAgo) {
        const month = format(expenseDate, 'yyyy-MM');
        monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
      }
    });

    return Object.keys(monthlyTotals)
      .map(month => ({
        name: format(new Date(month + '-02'), 'MMM yy'), // Use day 2 to avoid timezone issues
        Gastos: monthlyTotals[month],
      }))
      .reverse();
  };

  const data = processData();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Tendencia de Gastos (Últimos 6 Meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-MX')}`} />
                <Legend />
                <Line type="monotone" dataKey="Gastos" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
