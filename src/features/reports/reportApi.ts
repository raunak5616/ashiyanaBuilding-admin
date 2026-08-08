import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

// ─── Shared types ──────────────────────────────────────────────────────────────

export type RangePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

export interface BaseReportParams {
  range?: RangePreset;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ─── Response item types ───────────────────────────────────────────────────────

export interface SalesReportItem {
  id: string;
  saleNumber: string;
  saleDate?: string;
  grandTotal: number;
  status: string;
  customer?: { id: string; customerName: string } | null;
  createdAt: string;
}

export interface PurchasesReportItem {
  id: string;
  purchaseNumber: string;
  purchaseDate?: string;
  grandTotal: number;
  status: string;
  supplier?: { id: string; name: string; companyName?: string } | null;
  createdAt: string;
}

export interface ExpensesReportItem {
  id: string;
  expenseNumber: string;
  expenseDate?: string;
  title: string;
  amount: number;
  paymentMethod?: string;
  status: string;
  category?: { id: string; name: string } | null;
  createdAt: string;
}

export interface InventoryReportItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  sellingPrice: number;
  purchasePrice: number;
  stockValueAtSellingPrice: number;
  stockValueAtPurchasePrice: number;
  category?: { id: string; name: string } | null;
}

export interface LowStockReportItem {
  _id: string;
  name: string;
  sku: string;
  minimumStock: number;
  currentStock: number;
  sellingPrice: number;
  category?: { _id: string; name: string } | null;
}

export interface StockLedgerReportItem {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceId?: string;
  referenceModel?: string;
  createdAt: string;
  actorUser?: { id: string; fullName: string } | null;
  product?: { id: string; name: string; sku: string } | null;
}

export interface CustomerSalesReportItem {
  _id: string;
  salesCount: number;
  grandTotal: number;
  subtotal: number;
  discount: number;
  tax: number;
  customer: {
    _id: string | null;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface SupplierPurchasesReportItem {
  supplierId: string;
  supplierName: string;
  companyName?: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate?: string;
}

export interface ProfitSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export interface TimelineItem {
  date?: string;
  month?: string;
  salesCount: number;
  salesAmount: number;
  purchasesCount: number;
  purchasesAmount: number;
  expensesCount: number;
  expensesAmount: number;
  netCashFlow: number;
}

// ─── Query param types ─────────────────────────────────────────────────────────

export interface SalesReportParams extends BaseReportParams {
  customerId?: string;
  status?: string;
}

export interface PurchasesReportParams extends BaseReportParams {
  supplierId?: string;
  status?: string;
}

export interface ExpensesReportParams extends BaseReportParams {
  categoryId?: string;
  status?: string;
  paymentMethod?: string;
}

export interface InventoryReportParams {
  categoryId?: string;
  brandId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LowStockReportParams {
  categoryId?: string;
  brandId?: string;
  page?: number;
  limit?: number;
}

export interface StockLedgerReportParams extends BaseReportParams {
  productId?: string;
  type?: string;
}

export interface CustomerSalesReportParams extends BaseReportParams {
  customerId?: string;
}

export interface SupplierPurchasesReportParams extends BaseReportParams {
  supplierId?: string;
}

export interface ProfitSummaryParams {
  range?: RangePreset;
  startDate?: string;
  endDate?: string;
}

// ─── API Slice ─────────────────────────────────────────────────────────────────

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<ApiResponse<SalesReportItem[]>, SalesReportParams>({
      query: (params) => ({ url: '/reports/sales', method: 'GET', params }),
    }),
    getPurchasesReport: builder.query<ApiResponse<PurchasesReportItem[]>, PurchasesReportParams>({
      query: (params) => ({ url: '/reports/purchases', method: 'GET', params }),
    }),
    getExpensesReport: builder.query<ApiResponse<ExpensesReportItem[]>, ExpensesReportParams>({
      query: (params) => ({ url: '/reports/expenses', method: 'GET', params }),
    }),
    getInventoryReport: builder.query<ApiResponse<InventoryReportItem[]>, InventoryReportParams>({
      query: (params) => ({ url: '/reports/inventory', method: 'GET', params }),
    }),
    getLowStockReport: builder.query<ApiResponse<LowStockReportItem[]>, LowStockReportParams>({
      query: (params) => ({ url: '/reports/low-stock', method: 'GET', params }),
    }),
    getStockLedgerReport: builder.query<ApiResponse<StockLedgerReportItem[]>, StockLedgerReportParams>({
      query: (params) => ({ url: '/reports/stock-ledger', method: 'GET', params }),
    }),
    getCustomerSalesReport: builder.query<ApiResponse<CustomerSalesReportItem[]>, CustomerSalesReportParams>({
      query: (params) => ({ url: '/reports/customer-sales', method: 'GET', params }),
    }),
    getSupplierPurchasesReport: builder.query<ApiResponse<SupplierPurchasesReportItem[]>, SupplierPurchasesReportParams>({
      query: (params) => ({ url: '/reports/supplier-purchases', method: 'GET', params }),
    }),
    getProfitSummaryReport: builder.query<ApiResponse<ProfitSummary>, ProfitSummaryParams>({
      query: (params) => ({ url: '/reports/profit-summary', method: 'GET', params }),
    }),
    getReportDailySummary: builder.query<ApiResponse<TimelineItem[]>, ProfitSummaryParams>({
      query: (params) => ({ url: '/reports/daily-summary', method: 'GET', params }),
    }),
    getReportMonthlySummary: builder.query<ApiResponse<TimelineItem[]>, ProfitSummaryParams>({
      query: (params) => ({ url: '/reports/monthly-summary', method: 'GET', params }),
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetPurchasesReportQuery,
  useGetExpensesReportQuery,
  useGetInventoryReportQuery,
  useGetLowStockReportQuery,
  useGetStockLedgerReportQuery,
  useGetCustomerSalesReportQuery,
  useGetSupplierPurchasesReportQuery,
  useGetProfitSummaryReportQuery,
  useGetReportDailySummaryQuery,
  useGetReportMonthlySummaryQuery,
} = reportApi;
