import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtSale: number; // in paise
  tax?: number; // in paise
  discount?: number; // in paise
  lineTotal: number; // in paise
}

export interface Sale {
  id: string;
  shopId: string;
  saleNumber: string;
  customerId: string | null;
  saleDate?: string;
  status: 'draft' | 'completed' | 'cancelled';
  discount: number; // in paise
  tax: number; // in paise
  subtotal: number; // in paise
  grandTotal: number; // in paise
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}

export interface ListSalesQueryParams {
  status?: 'draft' | 'completed' | 'cancelled';
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateSaleItemPayload {
  productId: string;
  quantity: number;
  tax?: number; // in paise
  discount?: number; // in paise
}

export interface CreateSalePayload {
  saleNumber: string;
  customerId?: string | null;
  saleDate?: string;
  discount?: number; // in paise
  tax?: number; // in paise
  notes?: string;
  items: CreateSaleItemPayload[];
}

export interface UpdateSalePayload {
  saleNumber?: string;
  customerId?: string | null;
  saleDate?: string;
  discount?: number; // in paise
  tax?: number; // in paise
  notes?: string;
  items?: CreateSaleItemPayload[];
}

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<ApiResponse<Sale[]>, ListSalesQueryParams | void>({
      query: (params) => ({
        url: '/sales',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Sale' as const, id })),
              { type: 'Sale' as const, id: 'LIST' },
            ]
          : [{ type: 'Sale' as const, id: 'LIST' }],
    }),
    getSaleById: builder.query<ApiResponse<Sale>, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Sale' as const, id }],
    }),
    createSale: builder.mutation<ApiResponse<Sale>, CreateSalePayload>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Sale' as const, id: 'LIST' }],
    }),
    updateSale: builder.mutation<ApiResponse<Sale>, { id: string; body: UpdateSalePayload }>({
      query: ({ id, body }) => ({
        url: `/sales/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sale' as const, id },
        { type: 'Sale' as const, id: 'LIST' },
      ],
    }),
    completeSale: builder.mutation<ApiResponse<Sale>, string>({
      query: (id) => ({
        url: `/sales/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sale' as const, id },
        { type: 'Sale' as const, id: 'LIST' },
        { type: 'Inventory' as const, id: 'LIST' },
      ],
    }),
    cancelSale: builder.mutation<ApiResponse<Sale>, string>({
      query: (id) => ({
        url: `/sales/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sale' as const, id },
        { type: 'Sale' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useCompleteSaleMutation,
  useCancelSaleMutation,
} = salesApi;
