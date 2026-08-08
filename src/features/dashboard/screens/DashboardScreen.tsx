import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AppCard from '@/components/common/AppCard';
import ErrorPage from '@/components/common/ErrorPage';
import logoImage from '@/assets/Aashiyana.jpg';

// Import widgets
import DashboardHeader from '../components/DashboardHeader';
import SummaryGrid from '../components/SummaryGrid';
import ChartCard from '../components/ChartCard';
import QuickActionCard from '../components/QuickActionCard';
import LowStockWidget from '../components/LowStockWidget';
import RecentSalesTable from '../components/RecentSalesTable';
import RecentPurchaseTable from '../components/RecentPurchaseTable';
import TopProductsTable from '../components/TopProductsTable';
import DashboardSkeleton from '../components/DashboardSkeleton';

// Import queries
import {
  useGetDashboardSummaryQuery,
  useGetDailySummaryTimelineQuery,
  useGetMonthlySummaryTimelineQuery,
} from '../dashboardApi';

// Import MUI Icons
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  
  const [range, setRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const handleRangeChange = (newRange: string, start?: string, end?: string) => {
    setRange(newRange);
    setStartDate(start);
    setEndDate(end);
  };

  const queryParams = { range, startDate, endDate };

  // Parallel API queries to maximize UI performance
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useGetDashboardSummaryQuery(queryParams);

  const {
    data: dailyTimelineData,
    isLoading: dailyLoading,
    error: dailyError,
  } = useGetDailySummaryTimelineQuery(queryParams);

  const {
    data: monthlyTimelineData,
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useGetMonthlySummaryTimelineQuery(queryParams);

  const [activeTab, setActiveTab] = useState(0);

  const formatCurrency = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return amountInRupees.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
  };

  const isGlobalLoading = summaryLoading || dailyLoading || monthlyLoading;
  const isGlobalError = summaryError || dailyError || monthlyError;

  if (isGlobalLoading) {
    return <DashboardSkeleton />;
  }

  if (isGlobalError || !summaryData) {
    return (
      <ErrorPage
        title="Dashboard Error"
        message="Failed to load dashboard metrics. Please check server connection and try again."
      />
    );
  }

  const summary = summaryData.data;
  const dailyTimeline = dailyTimelineData?.data || [];
  const monthlyTimeline = monthlyTimelineData?.data || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Range controls */}
      <DashboardHeader
        user={user}
        range={range}
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleRangeChange}
      />

      {/* Primary Highlights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none font-sans">
        {/* Active Node Info */}
        <AppCard title="Shop Information" subtitle="Active connection node parameters">
          <div className="flex items-start gap-4 py-1.5">
            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
              <img src={logoImage} alt="Aashiyana Logo" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-800 leading-tight">
                Aashiyana Building Materials
              </h3>
              <div className="space-y-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                <p>Operator: <span className="font-bold text-slate-700">{user?.fullName}</span></p>
                <p>Role: <span className="font-bold text-slate-700 uppercase">{user?.isOwner ? 'Owner' : (user?.role?.name || 'Staff')}</span></p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Terminal Online</span>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Catalog Value Summary */}
        <AppCard title="Inventory Valuation" subtitle="Current product asset summary">
          <div className="flex items-start gap-4 py-1.5">
            <div className="p-3 bg-slate-900/10 border border-slate-900/20 text-slate-800 rounded-xl shrink-0">
              <InventoryIcon className="!h-6 !w-6" />
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
              <p>Total Stock count: <span className="font-black text-slate-800">{summary.inventory.totalStock} units</span></p>
              <p>Value (At Purchase): <span className="font-black text-slate-800">{formatCurrency(summary.inventory.valueAtPurchasePrice)}</span></p>
              <p>Value (At Sale): <span className="font-black text-slate-800">{formatCurrency(summary.inventory.valueAtSellingPrice)}</span></p>
              <p>Expected Profit Margin: <span className="font-black text-emerald-600">{formatCurrency(summary.inventory.valueAtSellingPrice - summary.inventory.valueAtPurchasePrice)}</span></p>
            </div>
          </div>
        </AppCard>

        {/* Monthly highlights counts */}
        <AppCard title="Monthly Snapshot" subtitle="This month's aggregate stats">
          <div className="flex items-start gap-4 py-1.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl shrink-0">
              <BarChartIcon className="!h-6 !w-6" />
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-500 font-medium leading-relaxed">
              <p>Monthly Sales Revenue: <span className="font-black text-slate-800">{formatCurrency(summary.sales.thisMonthAmount)}</span></p>
              <p>Invoice Volume: <span className="font-black text-slate-800">{summary.sales.thisMonthCount} bills</span></p>
              <p>Purchase Orders Logged: <span className="font-black text-slate-800">{summary.purchases.thisMonthAmount}</span></p>
              <p>Overall Entity Counts: <span className="font-bold text-slate-600">{summary.entityCounts.products} items / {summary.entityCounts.customers} clients</span></p>
            </div>
          </div>
        </AppCard>
      </div>

      {/* KPI Stats Row */}
      <SummaryGrid summary={summary} />

      {/* Charts Grid */}
      <ChartCard dailyTimeline={dailyTimeline} monthlyTimeline={monthlyTimeline} />

      {/* Quick Links actions shortcuts */}
      <QuickActionCard />

      {/* Tables and Widgets split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dynamic Lists Tab container */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 mb-5 gap-3 select-none">
            <div>
              <h3 className="text-sm font-black text-slate-800 font-heading">
                Operational Records
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Overview of recent actions and top performing assets
              </p>
            </div>

            {/* Tabs toggle controls */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setActiveTab(0)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg font-sans transition-all duration-150 ${
                  activeTab === 0 ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Recent Sales
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg font-sans transition-all duration-150 ${
                  activeTab === 1 ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Recent Purchases
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg font-sans transition-all duration-150 ${
                  activeTab === 2 ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Top Products
              </button>
            </div>
          </div>

          <div className="flex-grow">
            {activeTab === 0 && <RecentSalesTable sales={summary.recentSales} />}
            {activeTab === 1 && <RecentPurchaseTable purchases={summary.recentPurchases} />}
            {activeTab === 2 && <TopProductsTable products={summary.topSellingProducts} />}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <LowStockWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
