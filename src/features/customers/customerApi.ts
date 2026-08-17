import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface Customer {
  id: string;
  shopId: string;
  customerCode: string;
  customerType: 'individual' | 'business';
  customerName: string;
  businessName?: string;
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
  creditLimit?: number; // in paise
  isActive: boolean;
  createdBy?: string | null;
  hasAppAccount?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCustomersQueryParams {
  isActive?: boolean;
  customerType?: 'individual' | 'business';
  city?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerPayload {
  customerCode: string;
  customerType: 'individual' | 'business';
  customerName: string;
  businessName?: string;
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
  creditLimit?: number; // in paise
}

export interface UpdateCustomerPayload {
  customerCode?: string;
  customerType?: 'individual' | 'business';
  customerName?: string;
  businessName?: string;
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
  creditLimit?: number; // in paise
}

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<ApiResponse<Customer[]>, ListCustomersQueryParams | void>({
      query: (params) => ({
        url: '/customers',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer' as const, id: 'LIST' },
            ]
          : [{ type: 'Customer' as const, id: 'LIST' }],
    }),
    getCustomerById: builder.query<ApiResponse<Customer>, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Customer' as const, id }],
    }),
    createCustomer: builder.mutation<ApiResponse<Customer>, CreateCustomerPayload>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer' as const, id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<ApiResponse<Customer>, { id: string; body: UpdateCustomerPayload }>({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer' as const, id },
        { type: 'Customer' as const, id: 'LIST' },
      ],
    }),
    archiveCustomer: builder.mutation<ApiResponse<Customer>, string>({
      query: (id) => ({
        url: `/customers/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer' as const, id },
        { type: 'Customer' as const, id: 'LIST' },
      ],
    }),
    restoreCustomer: builder.mutation<ApiResponse<Customer>, string>({
      query: (id) => ({
        url: `/customers/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer' as const, id },
        { type: 'Customer' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useArchiveCustomerMutation,
  useRestoreCustomerMutation,
} = customerApi;
