
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Investment } from '../../types';
import { investmentUpdateService } from '../../services/investmentUpdateService';
import { useTheme } from '../../hooks/useTheme';

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
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<{ date: string; [platform: string]: number | string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      if (investments.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get data from last 6 months or from earliest investment start date, whichever is more recent
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const earliestStart = new Date(
          Math.min(...investments.map(inv => new Date(inv.startDate).getTime()))
        );

        const startDate = earliestStart > sixMonthsAgo ? earliestStart : sixMonthsAgo;

        // Fetch aggregated snapshots from the service
        const snapshots = await investmentUpdateService.getAggregatedSnapshotsByPlatform(startDate);

        // Format for chart
        const formattedData = snapshots.map(snapshot => ({
          date: new Date(snapshot.date).toLocaleDateString('en-CA'), // YYYY-MM-DD
          ...Object.fromEntries(
            Object.entries(snapshot).filter(([key]) => key !== 'date')
          )
        }));

        // If we have no snapshots yet, show current values as single point
        if (formattedData.length === 0) {
          const today = new Date().toLocaleDateString('en-CA');
          const todayData: { date: string; [platform: string]: number | string } = { date: today };

          investments.forEach(inv => {
            if (!todayData[inv.platform]) {
              todayData[inv.platform] = 0;
            }
            todayData[inv.platform] = (todayData[inv.platform] as number) + inv.currentValue;
          });

          setChartData([todayData]);
        } else {
          // Sample data if there are too many points (keep every nth point for performance)
          const maxPoints = 180; // Show max 180 data points
          if (formattedData.length > maxPoints) {
            const step = Math.ceil(formattedData.length / maxPoints);
            const sampledData = formattedData.filter((_, index) => index % step === 0);
            // Always include the last data point
            if (sampledData[sampledData.length - 1] !== formattedData[formattedData.length - 1]) {
              sampledData.push(formattedData[formattedData.length - 1]);
            }
            setChartData(sampledData);
          } else {
            setChartData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [investments]);

  if (investments.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de inversión para el gráfico.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500">No historical data available yet. Check back tomorrow!</p>;
  }

  const platforms = [...new Set(investments.map(inv => inv.platform))];
  const tooltipContentStyle = theme === 'dark' ? { backgroundColor: '#212529', border: 'none' } : {};
  const tooltipLabelStyle = theme === 'dark' ? { color: '#fff' } : {};

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipLabelStyle}
        />
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
