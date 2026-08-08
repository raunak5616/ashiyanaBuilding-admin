import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import AppCard from '@/components/common/AppCard';
import { SummaryTimelineItem } from '../dashboardApi';

interface ChartCardProps {
  dailyTimeline: SummaryTimelineItem[];
  monthlyTimeline: SummaryTimelineItem[];
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  dailyTimeline = [],
  monthlyTimeline = [],
}) => {
  const sortedDaily = [...dailyTimeline].reverse();
  const sortedMonthly = [...monthlyTimeline].reverse();

  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-xl font-sans leading-relaxed select-none">
          <p className="font-bold mb-1 text-slate-300">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any, idx: number) => (
              <p key={idx} style={{ color: p.color }}>
                {p.name}: <span className="font-bold text-white">{formatCurrency(p.value)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
      {/* Daily Area Chart */}
      <AppCard 
        title="Operations Trend" 
        subtitle="Daily sales, purchases, and expenses comparison"
      >
        <div className="h-72 w-full pt-2">
          {sortedDaily.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sortedDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4C430" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F4C430" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E1E1E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E1E1E" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => { const r = v / 100; return `₹${r >= 1000 ? (r / 1000).toFixed(0) + 'k' : r}`; }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  name="Sales"
                  dataKey="salesAmount" 
                  stroke="#F4C430" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  name="Purchases"
                  dataKey="purchasesAmount" 
                  stroke="#1E1E1E" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPurchases)" 
                />
                <Area 
                  type="monotone" 
                  name="Expenses"
                  dataKey="expensesAmount" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No timeline operations data recorded for this range
            </div>
          )}
        </div>
      </AppCard>

      {/* Monthly Bar Chart */}
      <AppCard 
        title="Monthly Performance" 
        subtitle="Monthly sales and net cash flow performance"
      >
        <div className="h-72 w-full pt-2">
          {sortedMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94A3B8" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => { const r = v / 100; return `₹${r >= 1000 ? (r / 1000).toFixed(0) + 'k' : r}`; }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar 
                  name="Sales Revenue"
                  dataKey="salesAmount" 
                  fill="#F4C430" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar 
                  name="Net Cash Flow"
                  dataKey="netCashFlow" 
                  fill="#22C55E" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No monthly aggregation timeline data recorded
            </div>
          )}
        </div>
      </AppCard>
    </div>
  );
};

export default ChartCard;
