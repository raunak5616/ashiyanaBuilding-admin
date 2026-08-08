import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

export interface ExpenseCategory {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  shopId: string;
  expenseNumber: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number; // in paise
  expenseDate?: string;
  paymentMethod?: string;
  status: 'pending' | 'paid';
  notes?: string;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListExpenseCategoriesQueryParams {
  isActive?: boolean;
  search?: string;
}

export interface ListExpensesQueryParams {
  isActive?: boolean;
  categoryId?: string;
  status?: 'pending' | 'paid';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpenseCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryPayload {
  name?: string;
  description?: string;
}

export interface CreateExpensePayload {
  expenseNumber: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number; // in paise
  expenseDate?: string;
  paymentMethod?: string;
  status?: 'pending' | 'paid';
  notes?: string;
}

export interface UpdateExpensePayload {
  expenseNumber?: string;
  categoryId?: string;
  title?: string;
  description?: string;
  amount?: number; // in paise
  expenseDate?: string;
  paymentMethod?: string;
  status?: 'pending' | 'paid';
  notes?: string;
}

export const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Category Endpoints
    getExpenseCategories: builder.query<ApiResponse<ExpenseCategory[]>, ListExpenseCategoriesQueryParams | void>({
      query: (params) => ({
        url: '/expense-categories',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ExpenseCategory' as const, id })),
              { type: 'ExpenseCategory' as const, id: 'LIST' },
            ]
          : [{ type: 'ExpenseCategory' as const, id: 'LIST' }],
    }),
    createExpenseCategory: builder.mutation<ApiResponse<ExpenseCategory>, CreateExpenseCategoryPayload>({
      query: (body) => ({
        url: '/expense-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ExpenseCategory' as const, id: 'LIST' }],
    }),
    updateExpenseCategory: builder.mutation<ApiResponse<ExpenseCategory>, { id: string; body: UpdateExpenseCategoryPayload }>({
      query: ({ id, body }) => ({
        url: `/expense-categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ExpenseCategory' as const, id },
        { type: 'ExpenseCategory' as const, id: 'LIST' },
      ],
    }),
    archiveExpenseCategory: builder.mutation<ApiResponse<ExpenseCategory>, string>({
      query: (id) => ({
        url: `/expense-categories/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ExpenseCategory' as const, id },
        { type: 'ExpenseCategory' as const, id: 'LIST' },
      ],
    }),
    restoreExpenseCategory: builder.mutation<ApiResponse<ExpenseCategory>, string>({
      query: (id) => ({
        url: `/expense-categories/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ExpenseCategory' as const, id },
        { type: 'ExpenseCategory' as const, id: 'LIST' },
      ],
    }),

    // Expense Endpoints
    getExpenses: builder.query<ApiResponse<Expense[]>, ListExpensesQueryParams | void>({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params: params ? {
          ...params,
          isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
        } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Expense' as const, id })),
              { type: 'Expense' as const, id: 'LIST' },
            ]
          : [{ type: 'Expense' as const, id: 'LIST' }],
    }),
    getExpenseById: builder.query<ApiResponse<Expense>, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Expense' as const, id }],
    }),
    createExpense: builder.mutation<ApiResponse<Expense>, CreateExpensePayload>({
      query: (body) => ({
        url: '/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Expense' as const, id: 'LIST' }],
    }),
    updateExpense: builder.mutation<ApiResponse<Expense>, { id: string; body: UpdateExpensePayload }>({
      query: ({ id, body }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Expense' as const, id },
        { type: 'Expense' as const, id: 'LIST' },
      ],
    }),
    archiveExpense: builder.mutation<ApiResponse<Expense>, string>({
      query: (id) => ({
        url: `/expenses/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Expense' as const, id },
        { type: 'Expense' as const, id: 'LIST' },
      ],
    }),
    restoreExpense: builder.mutation<ApiResponse<Expense>, string>({
      query: (id) => ({
        url: `/expenses/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Expense' as const, id },
        { type: 'Expense' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useArchiveExpenseCategoryMutation,
  useRestoreExpenseCategoryMutation,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useArchiveExpenseMutation,
  useRestoreExpenseMutation,
} = expenseApi;
