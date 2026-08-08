import { apiSlice } from '@/api/apiSlice';

export interface InventoryItem {
  productId: string;
  name: string;
  sku: string;
  minimumStock: number;
  currentStock: number;
  lastMovementAt: string | null;
  isActive: boolean;
  images: { url: string; publicId: string }[];
  categoryId: string | null;
  brandId: string | null;
  unitId: string | null;
}

export interface StockLedgerEntry {
  id: string;
  productId: string;
  type: 'opening' | 'adjustment_increase' | 'adjustment_decrease' | string;
  quantityChange: number;
  balanceAfter: number;
  reason: string | null;
  createdAt: string;
  actor: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface InventoryListResponse {
  items: InventoryItem[];
  total: number;
}

export interface HistoryListResponse {
  items: StockLedgerEntry[];
  total: number;
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryList: builder.query<
      InventoryListResponse,
      { page?: number; limit?: number; search?: string; lowStockOnly?: boolean; isActive?: boolean }
    >({
      query: (params) => ({
        url: '/inventory',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: InventoryItem[]; meta?: { total: number } }) => {
        return {
          items: response.data,
          total: response.meta?.total || response.data.length,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ productId }) => ({ type: 'Inventory' as const, id: productId })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),

    getCurrentStock: builder.query<InventoryItem, string>({
      query: (productId) => `/inventory/${productId}`,
      transformResponse: (response: { data: InventoryItem }) => response.data,
      providesTags: (_result, _error, productId) => [{ type: 'Inventory', id: productId }],
    }),

    setOpeningStock: builder.mutation<
      InventoryItem,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/inventory/${productId}/opening-stock`,
        method: 'POST',
        body: { quantity },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: productId },
      ],
    }),

    adjustStock: builder.mutation<
      InventoryItem,
      { productId: string; quantityChange: number; reason: string }
    >({
      query: ({ productId, quantityChange, reason }) => ({
        url: `/inventory/${productId}/adjust`,
        method: 'POST',
        body: { quantityChange, reason },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: productId },
      ],
    }),

    getInventoryHistory: builder.query<
      HistoryListResponse,
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, ...params }) => ({
        url: `/inventory/${productId}/history`,
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: StockLedgerEntry[]; meta?: { total: number } }) => {
        return {
          items: response.data,
          total: response.meta?.total || response.data.length,
        };
      },
      providesTags: (_result, _error, { productId }) => [
        { type: 'Inventory', id: `HISTORY_${productId}` },
      ],
    }),
  }),
});

export const {
  useGetInventoryListQuery,
  useGetCurrentStockQuery,
  useSetOpeningStockMutation,
  useAdjustStockMutation,
  useGetInventoryHistoryQuery,
} = inventoryApi;
