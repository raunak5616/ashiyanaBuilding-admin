import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface PurchaseItem {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number; // in paise
  tax?: number; // in paise
  discount?: number; // in paise
  lineTotal: number; // in paise
}

export interface Purchase {
  id: string;
  shopId: string;
  purchaseNumber: string;
  supplierId: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  discount: number; // in paise
  tax: number; // in paise
  shipping: number; // in paise
  otherCharges: number; // in paise
  subtotal: number; // in paise
  grandTotal: number; // in paise
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseItem[];
}

export interface ListPurchasesQueryParams {
  status?: 'draft' | 'confirmed' | 'cancelled';
  supplierId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchaseItemPayload {
  productId: string;
  quantity: number;
  purchasePrice: number; // in paise
  tax?: number; // in paise
  discount?: number; // in paise
}

export interface CreatePurchasePayload {
  purchaseNumber: string;
  supplierId: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  discount?: number; // in paise
  tax?: number; // in paise
  shipping?: number; // in paise
  otherCharges?: number; // in paise
  notes?: string;
  items: CreatePurchaseItemPayload[];
}

export interface UpdatePurchasePayload {
  purchaseNumber?: string;
  supplierId?: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  discount?: number; // in paise
  tax?: number; // in paise
  shipping?: number; // in paise
  otherCharges?: number; // in paise
  notes?: string;
  items?: CreatePurchaseItemPayload[];
}

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query<ApiResponse<Purchase[]>, ListPurchasesQueryParams | void>({
      query: (params) => ({
        url: '/purchases',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Purchase' as const, id })),
              { type: 'Purchase' as const, id: 'LIST' },
            ]
          : [{ type: 'Purchase' as const, id: 'LIST' }],
    }),
    getPurchaseById: builder.query<ApiResponse<Purchase>, string>({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Purchase' as const, id }],
    }),
    createPurchase: builder.mutation<ApiResponse<Purchase>, CreatePurchasePayload>({
      query: (body) => ({
        url: '/purchases',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Purchase' as const, id: 'LIST' }],
    }),
    updatePurchase: builder.mutation<ApiResponse<Purchase>, { id: string; body: UpdatePurchasePayload }>({
      query: ({ id, body }) => ({
        url: `/purchases/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Purchase' as const, id },
        { type: 'Purchase' as const, id: 'LIST' },
      ],
    }),
    confirmPurchase: builder.mutation<ApiResponse<Purchase>, string>({
      query: (id) => ({
        url: `/purchases/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Purchase' as const, id },
        { type: 'Purchase' as const, id: 'LIST' },
        { type: 'Inventory' as const, id: 'LIST' },
      ],
    }),
    cancelPurchase: builder.mutation<ApiResponse<Purchase>, string>({
      query: (id) => ({
        url: `/purchases/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Purchase' as const, id },
        { type: 'Purchase' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useConfirmPurchaseMutation,
  useCancelPurchaseMutation,
} = purchaseApi;
