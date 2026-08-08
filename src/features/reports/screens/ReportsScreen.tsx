import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

import AppCard from '@/components/common/AppCard';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusChip from '@/components/common/StatusChip';
import ReportDateRangeBar from '../components/ReportDateRangeBar';
import ReportKpiBar from '../components/ReportKpiBar';

import {
  useGetSalesReportQuery,
  useGetPurchasesReportQuery,
  useGetExpensesReportQuery,
  useGetInventoryReportQuery,
  useGetLowStockReportQuery,
  useGetStockLedgerReportQuery,
  useGetCustomerSalesReportQuery,
  useGetProfitSummaryReportQuery,
  useGetReportDailySummaryQuery,
  useGetReportMonthlySummaryQuery,
  RangePreset,
  SalesReportItem,
  PurchasesReportItem,
  ExpensesReportItem,
  InventoryReportItem,
  LowStockReportItem,
  StockLedgerReportItem,
  CustomerSalesReportItem,
} from '../reportApi';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val / 100);




const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const saleChip = (s: string) => {
  if (s === 'completed') return <StatusChip status="success" label="Completed" />;
  if (s === 'cancelled') return <StatusChip status="error" label="Cancelled" />;
  return <StatusChip status="warning" label="Draft" />;
};

const poChip = (s: string) => {
  if (s === 'confirmed') return <StatusChip status="success" label="Confirmed" />;
  if (s === 'cancelled') return <StatusChip status="error" label="Cancelled" />;
  return <StatusChip status="warning" label="Draft" />;
};

const expChip = (s: string) =>
  s === 'paid' ? <StatusChip status="success" label="Paid" /> : <StatusChip status="warning" label="Pending" />;

// ─── Chart Tooltip ─────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-xl font-sans leading-relaxed select-none">
      <p className="font-bold mb-1 text-slate-300">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'profit', label: '💰 Profit Summary' },
  { id: 'sales', label: '🧾 Sales' },
  { id: 'purchases', label: '🛒 Purchases' },
  { id: 'expenses', label: '💸 Expenses' },
  { id: 'inventory', label: '📦 Inventory' },
  { id: 'customers', label: '👥 Customers' },
  { id: 'stock-ledger', label: '📋 Stock Ledger' },
];

// ─── Main Screen ───────────────────────────────────────────────────────────────

export const ReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profit');
  const [range, setRange] = useState<RangePreset>('thisMonth');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const handleRangeChange = (r: RangePreset, s?: string, e?: string) => {
    setRange(r);
    setStartDate(s);
    setEndDate(e);
    setPage(1);
  };

  const dateParams = { range, startDate, endDate };
  const paginatedParams = { ...dateParams, page, limit };

  // ── Queries ──
  const { data: profitData, isLoading: profitLoading } = useGetProfitSummaryReportQuery(dateParams, { skip: activeTab !== 'profit' });
  const { data: dailyData, isLoading: dailyLoading } = useGetReportDailySummaryQuery(dateParams, { skip: activeTab !== 'profit' });
  const { data: monthlyData, isLoading: monthlyLoading } = useGetReportMonthlySummaryQuery(dateParams, { skip: activeTab !== 'profit' });

  const { data: salesData, isLoading: salesLoading } = useGetSalesReportQuery(paginatedParams, { skip: activeTab !== 'sales' });
  const { data: purchasesData, isLoading: purchasesLoading } = useGetPurchasesReportQuery(paginatedParams, { skip: activeTab !== 'purchases' });
  const { data: expensesData, isLoading: expensesLoading } = useGetExpensesReportQuery(paginatedParams, { skip: activeTab !== 'expenses' });
  const { data: inventoryData, isLoading: inventoryLoading } = useGetInventoryReportQuery({ page, limit }, { skip: activeTab !== 'inventory' });
  const { data: lowStockData, isLoading: lowStockLoading } = useGetLowStockReportQuery({ page, limit }, { skip: activeTab !== 'inventory' });
  const { data: customersData, isLoading: customersLoading } = useGetCustomerSalesReportQuery(paginatedParams, { skip: activeTab !== 'customers' });
  const { data: ledgerData, isLoading: ledgerLoading } = useGetStockLedgerReportQuery(paginatedParams, { skip: activeTab !== 'stock-ledger' });

  const profit = profitData?.data;
  const daily = [...(dailyData?.data || [])].reverse();
  const monthly = [...(monthlyData?.data || [])].reverse();
  const sales = salesData?.data || [];
  const salesTotal = salesData?.metadata?.total || 0;
  const salesTotals = (salesData?.metadata as any)?.totals;
  const purchases = purchasesData?.data || [];
  const purchasesTotal = purchasesData?.metadata?.total || 0;
  const purchasesTotals = (purchasesData?.metadata as any)?.totals;
  const expenses = expensesData?.data || [];
  const expensesTotal = expensesData?.metadata?.total || 0;
  const expensesTotals = (expensesData?.metadata as any)?.totals;
  const inventory = inventoryData?.data || [];
  const inventoryTotal = inventoryData?.metadata?.total || 0;
  const inventoryTotals = (inventoryData?.metadata as any)?.totals;
  const lowStock = lowStockData?.data || [];
  const lowStockTotal = lowStockData?.metadata?.total || 0;
  const customers = customersData?.data || [];
  const customersTotal = customersData?.metadata?.total || 0;
  const customersTotals = (customersData?.metadata as any)?.totals;
  const ledger = ledgerData?.data || [];
  const ledgerTotal = ledgerData?.metadata?.total || 0;

  // ── Columns ──────────────────────────────────────────────────────────────────

  const salesColumns: Column<SalesReportItem>[] = [
    { key: 'saleNumber', label: 'Sale #', render: (r) => <span className="font-bold text-xs text-slate-800">{r.saleNumber}</span> },
    { key: 'saleDate', label: 'Date', render: (r) => <span className="text-xs text-slate-600">{fmtDate(r.saleDate)}</span> },
    { key: 'customer', label: 'Customer', render: (r) => <span className="text-xs text-slate-700">{(r as any).customer?.fullName || 'Walk-in'}</span> },
    { key: 'grandTotal', label: 'Grand Total', render: (r) => <span className="text-xs font-bold text-slate-800">{fmt(r.grandTotal)}</span> },
    { key: 'status', label: 'Status', render: (r) => saleChip(r.status) },
  ];

  const purchasesColumns: Column<PurchasesReportItem>[] = [
    { key: 'purchaseNumber', label: 'PO #', render: (r) => <span className="font-bold text-xs text-slate-800">{r.purchaseNumber}</span> },
    { key: 'purchaseDate', label: 'Date', render: (r) => <span className="text-xs text-slate-600">{fmtDate(r.purchaseDate)}</span> },
    { key: 'supplier', label: 'Supplier', render: (r) => <span className="text-xs text-slate-700">{r.supplier?.name || '—'}</span> },
    { key: 'grandTotal', label: 'Grand Total', render: (r) => <span className="text-xs font-bold text-slate-800">{fmt(r.grandTotal)}</span> },
    { key: 'status', label: 'Status', render: (r) => poChip(r.status) },
  ];

  const expensesColumns: Column<ExpensesReportItem>[] = [
    { key: 'expenseNumber', label: 'Expense #', render: (r) => <span className="font-bold text-xs text-slate-800">{r.expenseNumber}</span> },
    { key: 'expenseDate', label: 'Date', render: (r) => <span className="text-xs text-slate-600">{fmtDate(r.expenseDate)}</span> },
    { key: 'title', label: 'Title', render: (r) => <span className="text-xs text-slate-700">{r.title}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-xs text-slate-600">{r.category?.name || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (r) => <span className="text-xs font-bold text-slate-800">{fmt(r.amount)}</span> },
    { key: 'paymentMethod', label: 'Method', render: (r) => <span className="text-xs text-slate-500 capitalize">{r.paymentMethod || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => expChip(r.status) },
  ];

  const inventoryColumns: Column<InventoryReportItem>[] = [
    { key: 'name', label: 'Product', render: (r) => <div><p className="font-bold text-xs text-slate-800">{r.name}</p><p className="text-[10px] text-slate-400">{r.sku}</p></div> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-xs text-slate-600">{(r as any).category?.name || '—'}</span> },
    { key: 'currentStock', label: 'Stock', render: (r) => <span className="text-xs font-bold text-slate-800">{r.currentStock} units</span> },
    { key: 'purchasePrice', label: 'Purchase Price', render: (r) => <span className="text-xs text-slate-600">{fmt(r.purchasePrice)}</span> },
    { key: 'sellingPrice', label: 'Selling Price', render: (r) => <span className="text-xs text-slate-600">{fmt(r.sellingPrice)}</span> },
    { key: 'stockValueAtSellingPrice', label: 'Stock Value (Sale)', render: (r) => <span className="text-xs font-bold text-emerald-700">{fmt(r.stockValueAtSellingPrice)}</span> },
    { key: 'stockValueAtPurchasePrice', label: 'Stock Value (Cost)', render: (r) => <span className="text-xs font-bold text-slate-800">{fmt(r.stockValueAtPurchasePrice)}</span> },
  ];

  const lowStockColumns: Column<LowStockReportItem>[] = [
    { key: 'name', label: 'Product', render: (r) => <div><p className="font-bold text-xs text-slate-800">{r.name}</p><p className="text-[10px] text-slate-400">{r.sku}</p></div> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-xs text-slate-600">{r.category?.name || '—'}</span> },
    { key: 'currentStock', label: 'Current Stock', render: (r) => <span className="text-xs font-bold text-rose-600">{r.currentStock} units</span> },
    { key: 'minimumStock', label: 'Min Stock', render: (r) => <span className="text-xs text-slate-500">{r.minimumStock} units</span> },
    { key: 'deficit', label: 'Deficit', render: (r) => <span className="text-xs font-bold text-rose-500">{Math.max(0, r.minimumStock - r.currentStock)} units short</span> },
  ];

  const customersColumns: Column<CustomerSalesReportItem>[] = [
    { key: 'customer', label: 'Customer', render: (r) => <span className="font-bold text-xs text-slate-800">{r.customer?.fullName || 'Walk-in'}</span> },
    { key: 'phone', label: 'Phone', render: (r) => <span className="text-xs text-slate-500">{r.customer?.phone || '—'}</span> },
    { key: 'salesCount', label: 'Orders', render: (r) => <span className="text-xs font-bold text-slate-800">{r.salesCount}</span> },
    { key: 'grandTotal', label: 'Total Spent', render: (r) => <span className="text-xs font-bold text-slate-800">{fmt(r.grandTotal)}</span> },
    { key: 'avgOrder', label: 'Avg Order', render: (r) => <span className="text-xs text-slate-600">{r.salesCount > 0 ? fmt(Math.round(r.grandTotal / r.salesCount)) : '—'}</span> },
    { key: 'discount', label: 'Discounts', render: (r) => <span className="text-xs text-slate-500">{fmt(r.discount)}</span> },
  ];

  const ledgerColumns: Column<StockLedgerReportItem>[] = [
    { key: 'createdAt', label: 'Date', render: (r) => <span className="text-xs text-slate-600">{fmtDate(r.createdAt)}</span> },
    { key: 'product', label: 'Product', render: (r) => <span className="font-bold text-xs text-slate-800">{r.product?.name || '—'}<span className="block text-[10px] text-slate-400 font-normal">{r.product?.sku}</span></span> },
    { key: 'type', label: 'Type', render: (r) => <span className="text-xs font-semibold text-slate-700 capitalize">{(r as any).type?.replace(/_/g, ' ')}</span> },
    { key: 'quantityChange', label: 'Qty Δ', render: (r) => { const q = (r as any).quantityChange ?? 0; return <span className={`text-xs font-bold ${q > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{q > 0 ? '+' : ''}{q}</span>; } },
    { key: 'balanceAfter', label: 'Balance After', render: (r) => <span className="text-xs font-bold text-slate-700">{(r as any).balanceAfter ?? '—'}</span> },
    { key: 'actor', label: 'By', render: (r) => <span className="text-xs text-slate-500">{(r as any).actor?.fullName || '—'}</span> },
  ];

  // ── Loading helper ────────────────────────────────────────────────────────────
  const LoadingCenter = () => (
    <div className="flex items-center justify-center py-16">
      <CircularProgress size={32} className="text-slate-400" />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="mb-4">
          <h1 className="text-xl font-black text-secondary font-heading">Business Analytics & Reports</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">Export and analyse detailed financial and operational reports.</p>
        </div>
        <ReportDateRangeBar range={range} startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 px-4 gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 py-3.5 text-[11px] font-bold font-sans whitespace-nowrap transition-all duration-150 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">

          {/* ── PROFIT SUMMARY TAB ─────────────────────────────────────────── */}
          {activeTab === 'profit' && (
            <>
              {profitLoading ? <LoadingCenter /> : profit ? (
                <>
                  <ReportKpiBar items={[
                    { label: 'Sales Revenue', value: fmt(profit.revenue ?? 0), color: 'green' },
                    { label: 'Cost of Goods', value: fmt(profit.costOfGoodsSold ?? 0), color: 'red' },
                    { label: 'Gross Profit', value: fmt(profit.grossProfit ?? 0), sub: profit.revenue ? `Margin ${(((profit.grossProfit ?? 0) / profit.revenue) * 100).toFixed(1)}%` : '—', color: (profit.grossProfit ?? 0) >= 0 ? 'green' : 'red' },
                    { label: 'Total Expenses', value: fmt(profit.expenses ?? 0), color: 'red' },
                    { label: 'Net Profit', value: fmt(profit.netProfit ?? 0), sub: profit.revenue ? `Margin ${(((profit.netProfit ?? 0) / profit.revenue) * 100).toFixed(1)}%` : '—', color: (profit.netProfit ?? 0) >= 0 ? 'green' : 'red' },
                  ]} />

                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 text-xs font-sans text-slate-600 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div><span className="text-slate-400">Note: </span> <span className="text-slate-600">Profit summary includes only completed sales and paid expenses for the selected date range.</span></div>
                  </div>
                </>
              ) : null}

              {/* Daily Trend Chart */}
              {dailyLoading ? <LoadingCenter /> : (
                <AppCard title="Daily Cash Flow Trend" subtitle="Sales, purchases & expenses comparison by day">
                  <div className="h-72 w-full pt-2">
                    {daily.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="rSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F4C430" stopOpacity={0.18} />
                              <stop offset="95%" stopColor="#F4C430" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="rExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Area type="monotone" name="Sales" dataKey="salesAmount" stroke="#F4C430" strokeWidth={2} fillOpacity={1} fill="url(#rSales)" />
                          <Area type="monotone" name="Purchases" dataKey="purchasesAmount" stroke="#1E1E1E" strokeWidth={2} fillOpacity={1} fill="url(#rExp)" />
                          <Area type="monotone" name="Expenses" dataKey="expensesAmount" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#rExp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No daily data for this range</div>
                    )}
                  </div>
                </AppCard>
              )}

              {/* Monthly Bar Chart */}
              {monthlyLoading ? <LoadingCenter /> : (
                <AppCard title="Monthly Performance" subtitle="Monthly revenue vs net cash flow">
                  <div className="h-64 w-full pt-2">
                    {monthly.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar name="Sales Revenue" dataKey="salesAmount" fill="#F4C430" radius={[4, 4, 0, 0]} maxBarSize={28} />
                          <Bar name="Net Cash Flow" dataKey="netCashFlow" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No monthly data for this range</div>
                    )}
                  </div>
                </AppCard>
              )}
            </>
          )}

          {/* ── SALES TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'sales' && (
            <>
              {salesTotals && (
                <ReportKpiBar items={[
                  { label: 'Total Invoices', value: String(salesTotal), color: 'default' },
                  { label: 'Revenue', value: fmt(salesTotals.grandTotal ?? 0), color: 'green' },
                  { label: 'Tax Collected', value: fmt(salesTotals.tax ?? 0), color: 'blue' },
                  { label: 'Discounts Given', value: fmt(salesTotals.discount ?? 0), color: 'amber' },
                ]} />
              )}
              {salesLoading ? <LoadingCenter /> : (
                <DataTable columns={salesColumns} data={sales} loading={salesLoading}
                  page={page - 1} limit={limit} total={salesTotal}
                  onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                  emptyMessage="No sales records found for this date range." />
              )}
            </>
          )}

          {/* ── PURCHASES TAB ─────────────────────────────────────────────── */}
          {activeTab === 'purchases' && (
            <>
              {purchasesTotals && (
                <ReportKpiBar items={[
                  { label: 'Total Orders', value: String(purchasesTotal), color: 'default' },
                  { label: 'Total Cost', value: fmt(purchasesTotals.grandTotal ?? 0), color: 'red' },
                  { label: 'Tax Paid', value: fmt(purchasesTotals.tax ?? 0), color: 'blue' },
                  { label: 'Discounts', value: fmt(purchasesTotals.discount ?? 0), color: 'amber' },
                ]} />
              )}
              {purchasesLoading ? <LoadingCenter /> : (
                <DataTable columns={purchasesColumns} data={purchases} loading={purchasesLoading}
                  page={page - 1} limit={limit} total={purchasesTotal}
                  onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                  emptyMessage="No purchase orders found for this date range." />
              )}
            </>
          )}

          {/* ── EXPENSES TAB ──────────────────────────────────────────────── */}
          {activeTab === 'expenses' && (
            <>
              {expensesTotals && (
                <ReportKpiBar items={[
                  { label: 'Total Records', value: String(expensesTotal), color: 'default' },
                  { label: 'Total Spent', value: fmt(expensesTotals.amount ?? 0), color: 'red' },
                ]} />
              )}
              {expensesLoading ? <LoadingCenter /> : (
                <DataTable columns={expensesColumns} data={expenses} loading={expensesLoading}
                  page={page - 1} limit={limit} total={expensesTotal}
                  onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                  emptyMessage="No expense records found for this date range." />
              )}
            </>
          )}

          {/* ── INVENTORY TAB ─────────────────────────────────────────────── */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              {/* Inventory Valuation */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">📦 Inventory Valuation</h3>
                {inventoryTotals && (
                  <ReportKpiBar items={[
                    { label: 'Total Products', value: String(inventoryTotals.totalProducts ?? inventoryTotal), color: 'default' },
                    { label: 'Total Stock Units', value: String(inventoryTotals.totalStock ?? '—'), color: 'blue' },
                    { label: 'Value @ Purchase', value: fmt(inventoryTotals.valueAtPurchasePrice ?? 0), color: 'default' },
                    { label: 'Value @ Sale', value: fmt(inventoryTotals.valueAtSellingPrice ?? 0), color: 'green' },
                    { label: 'Expected Margin', value: fmt((inventoryTotals.valueAtSellingPrice ?? 0) - (inventoryTotals.valueAtPurchasePrice ?? 0)), color: 'green' },
                  ]} />
                )}
                {inventoryLoading ? <LoadingCenter /> : (
                  <div className="mt-4">
                    <DataTable columns={inventoryColumns} data={inventory} loading={inventoryLoading}
                      page={page - 1} limit={limit} total={inventoryTotal}
                      onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                      emptyMessage="No inventory data found." />
                  </div>
                )}
              </div>

              {/* Low Stock Alert */}
              <div>
                <h3 className="text-sm font-bold text-rose-600 mb-3">⚠️ Low Stock Alerts ({lowStockTotal})</h3>
                {lowStockLoading ? <LoadingCenter /> : (
                  <DataTable columns={lowStockColumns} data={lowStock} loading={lowStockLoading}
                    page={page - 1} limit={limit} total={lowStockTotal}
                    onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                    emptyMessage="No low-stock items. All products are sufficiently stocked." />
                )}
              </div>
            </div>
          )}

          {/* ── CUSTOMERS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'customers' && (
            <>
              {customersTotals && (
                <ReportKpiBar items={[
                  { label: 'Customers', value: String(customersTotal), color: 'default' },
                  { label: 'Total Revenue', value: fmt(customersTotals.revenue ?? 0), color: 'green' },
                  { label: 'Total Orders', value: String(customersTotals.totalOrders ?? '—'), color: 'blue' },
                ]} />
              )}
              {customersLoading ? <LoadingCenter /> : (
                <DataTable columns={customersColumns} data={customers} loading={customersLoading}
                  page={page - 1} limit={limit} total={customersTotal}
                  onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                  emptyMessage="No customer sales data for this date range." />
              )}
            </>
          )}

          {/* ── STOCK LEDGER TAB ──────────────────────────────────────────── */}
          {activeTab === 'stock-ledger' && (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-700 font-medium font-sans">
                📋 Showing all stock movements (sales, purchases, manual adjustments) for the selected period.
              </div>
              {ledgerLoading ? <LoadingCenter /> : (
                <DataTable columns={ledgerColumns} data={ledger} loading={ledgerLoading}
                  page={page - 1} limit={limit} total={ledgerTotal}
                  onPageChange={(v) => setPage(v + 1)} onLimitChange={(v) => { setLimit(v); setPage(1); }}
                  emptyMessage="No stock movements found for this date range." />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
