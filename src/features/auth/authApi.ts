import { apiSlice } from '@/api/apiSlice';
import { User } from './authSlice';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    refresh: builder.mutation<ApiResponse<LoginResponseData>, void>({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshMutation } = authApi;
export default authApi;
