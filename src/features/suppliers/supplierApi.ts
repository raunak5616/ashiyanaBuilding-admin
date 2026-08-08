import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface Supplier {
  id: string;
  shopId: string;
  supplierCode: string;
  businessName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListSuppliersQueryParams {
  isActive?: boolean;
  city?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupplierPayload {
  supplierCode: string;
  businessName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

export interface UpdateSupplierPayload {
  supplierCode?: string;
  businessName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

export const supplierApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<ApiResponse<Supplier[]>, ListSuppliersQueryParams | void>({
      query: (params) => ({
        url: '/suppliers',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Supplier' as const, id })),
              { type: 'Supplier' as const, id: 'LIST' },
            ]
          : [{ type: 'Supplier' as const, id: 'LIST' }],
    }),
    getSupplierById: builder.query<ApiResponse<Supplier>, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Supplier' as const, id }],
    }),
    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierPayload>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Supplier' as const, id: 'LIST' }],
    }),
    updateSupplier: builder.mutation<ApiResponse<Supplier>, { id: string; body: UpdateSupplierPayload }>({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier' as const, id },
        { type: 'Supplier' as const, id: 'LIST' },
      ],
    }),
    archiveSupplier: builder.mutation<ApiResponse<Supplier>, string>({
      query: (id) => ({
        url: `/suppliers/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Supplier' as const, id },
        { type: 'Supplier' as const, id: 'LIST' },
      ],
    }),
    restoreSupplier: builder.mutation<ApiResponse<Supplier>, string>({
      query: (id) => ({
        url: `/suppliers/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Supplier' as const, id },
        { type: 'Supplier' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useArchiveSupplierMutation,
  useRestoreSupplierMutation,
} = supplierApi;
