import React from 'react';
import StatCard from '@/components/common/StatCard';
import { DashboardSummary } from '../dashboardApi';

// Import MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface SummaryGridProps {
  summary: DashboardSummary;
}

export const SummaryGrid: React.FC<SummaryGridProps> = ({ summary }) => {
  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* Sales KPI Card */}
      <StatCard
        title="Today's Sales"
        value={formatCurrency(summary.sales.todayAmount)}
        icon={<TrendingUpIcon className="!h-5 !w-5" />}
        description={`${summary.sales.todayCount} invoices generated`}
      />

      {/* Purchases KPI Card */}
      <StatCard
        title="Today's Purchases"
        value={formatCurrency(summary.purchases.todayAmount)}
        icon={<LocalShippingIcon className="!h-5 !w-5" />}
        description={`${summary.purchases.todayCount} orders confirmed`}
      />

      {/* Expenses KPI Card */}
      <StatCard
        title="Period Expenses"
        value={formatCurrency(summary.expenses)}
        icon={<WalletIcon className="!h-5 !w-5" />}
        description="General operational expenses"
      />

      {/* Net Profit KPI Card */}
      <StatCard
        title="Net Profit"
        value={formatCurrency(summary.netProfit)}
        icon={<MonetizationOnIcon className="!h-5 !w-5" />}
        description={`Gross Profit: ${formatCurrency(summary.grossProfit)}`}
        className={summary.netProfit >= 0 ? '!border-emerald-200/80 bg-emerald-50/10' : '!border-rose-200/80 bg-rose-50/10'}
      />
    </div>
  );
};

export default SummaryGrid;
