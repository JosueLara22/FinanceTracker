
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Investment } from '../../types';

interface InvestmentChartProps {
  investments: Investment[];
}

const platformColors: { [key: string]: string } = {
  Nu: '#8884d8',
  Didi: '#82ca9d',
  MercadoPago: '#ffc658',
  Other: '#ff8042',
};

export const InvestmentChart: React.FC<InvestmentChartProps> = ({ investments }) => {
  /**
   * Simulates and memoizes historical investment data for the chart.
   * NOTE: This is a client-side simulation for demonstration purposes, as the database
   * does not store historical daily values. For a production application, this data
   * should be pre-calculated or stored in a time-series format.
   *
   * The simulation works by:
   * 1. Finding the earliest investment start date.
   * 2. Iterating day-by-day from that date until today.
   * 3. For each day, calculating the compound growth of each active investment.
   * 4. Aggregating the values by platform for the stacked area chart.
   * 
   * @returns {Array<Object>} An array of data points for the chart, where each object
   * has a 'date' and keys for each investment platform.
   */
  const chartData = useMemo(() => {
    if (investments.length === 0) return [];

    // Find the earliest start date
    const firstDate = new Date(Math.min(...investments.map(inv => new Date(inv.startDate).getTime())));
    const today = new Date();
    
    const data = [];
    const currentDate = new Date(firstDate);

    // This is a simulation of daily values. For a real app, you'd store historical data.
    while (currentDate <= today) {
      const dateString = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const dailyData: { [key: string]: number | string } = { date: dateString };

      investments.forEach(inv => {
        const startDate = new Date(inv.startDate);
        if (currentDate >= startDate) {
          const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
          // Simplified simulation of compound growth
          const value = inv.initialCapital * Math.pow(1 + inv.gatPercentage / 100 / 365, daysDiff);
          dailyData[inv.platform] = (dailyData[inv.platform] as number || 0) + value;
        }
      });

      data.push(dailyData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [investments]);

  if (investments.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de inversión para el gráfico.</p>;
  }

  const platforms = [...new Set(investments.map(inv => inv.platform))];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} />
        <Legend />
        {platforms.map(platform => (
          <Area 
            key={platform}
            type="monotone" 
            dataKey={platform} 
            stackId="1" 
            stroke={platformColors[platform]} 
            fill={platformColors[platform]} 
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
