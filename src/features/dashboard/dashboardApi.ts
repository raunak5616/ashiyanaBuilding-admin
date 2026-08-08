import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface DashboardSummary {
  sales: {
    todayAmount: number;
    todayCount: number;
    thisMonthAmount: number;
    thisMonthCount: number;
  };
  purchases: {
    todayAmount: number;
    todayCount: number;
    thisMonthAmount: number;
    thisMonthCount: number;
  };
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  inventory: {
    valueAtPurchasePrice: number;
    valueAtSellingPrice: number;
    totalStock: number;
  };
  lowStockCount: number;
  entityCounts: {
    products: number;
    customers: number;
    suppliers: number;
  };
  recentSales: {
    id: string;
    saleNumber: string;
    saleDate: string;
    grandTotal: number;
    status: string;
    customer: { id: string; fullName: string } | null;
  }[];
  recentPurchases: {
    id: string;
    purchaseNumber: string;
    purchaseDate: string;
    grandTotal: number;
    status: string;
    supplier: { id: string; name: string; companyName: string } | null;
  }[];
  topSellingProducts: {
    id: string;
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  topCustomers: {
    id: string;
    fullName: string;
    phone: string;
    salesCount: number;
    totalSpent: number;
  }[];
  topSuppliers: {
    id: string;
    name: string;
    companyName: string;
    purchasesCount: number;
    totalSupplied: number;
  }[];
}

export interface SummaryTimelineItem {
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

export interface LowStockItem {
  _id: string;
  name: string;
  sku: string;
  minimumStock: number;
  currentStock: number;
  sellingPrice: number;
  category: { _id: string; name: string } | null;
}

export interface DashboardQueryParams {
  range: string;
  startDate?: string;
  endDate?: string;
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<ApiResponse<DashboardSummary>, DashboardQueryParams>({
      query: (params) => ({
        url: '/dashboard',
        method: 'GET',
        params,
      }),
    }),
    getDailySummaryTimeline: builder.query<ApiResponse<SummaryTimelineItem[]>, DashboardQueryParams>({
      query: (params) => ({
        url: '/reports/daily-summary',
        method: 'GET',
        params,
      }),
    }),
    getMonthlySummaryTimeline: builder.query<ApiResponse<SummaryTimelineItem[]>, DashboardQueryParams>({
      query: (params) => ({
        url: '/reports/monthly-summary',
        method: 'GET',
        params,
      }),
    }),
    getLowStockProducts: builder.query<ApiResponse<LowStockItem[]>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/reports/low-stock',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetDailySummaryTimelineQuery,
  useGetMonthlySummaryTimelineQuery,
  useGetLowStockProductsQuery,
} = dashboardApi;
export default dashboardApi;
