import React, { useMemo } from 'react';
import { Expense } from '../../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  expenses: Expense[];
}

const COLORS = ['#667eea', '#764ba2', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ expenses }) => {
  const chartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    return Object.keys(categoryTotals).map(category => ({
      name: category,
      value: categoryTotals[category],
    }));
  }, [expenses]);

  if (chartData.length === 0) {
      return <p className='text-center text-gray-500'>No expense data for this period.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} />
        <Legend iconSize={10} layout='vertical' verticalAlign='middle' align='right' />
      </PieChart>
    </ResponsiveContainer>
  );
};