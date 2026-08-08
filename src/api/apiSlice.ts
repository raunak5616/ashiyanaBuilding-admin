import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setCredentials, clearCredentials, User } from '@/features/auth/authSlice';
import { ENV } from '@/config/env';

interface RootState {
  auth: {
    accessToken: string | null;
  };
}

// Custom base query configuration
const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_URL,
  credentials: 'include', // Ensures httpOnly cookies (refresh token) are sent
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Shared promise for refresh token to prevent concurrent duplicate refresh requests
let refreshResultPromise: Promise<any> | null = null;

// Custom wrapper to intercept 401 errors and handle refresh token flow
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // If a refresh is already in progress, wait for it to complete first
  if (refreshResultPromise) {
    await refreshResultPromise;
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { message?: string; errorCode?: string } | undefined;
    
    // If the account has been deactivated or the version is stale, log out immediately
    if (errorData?.errorCode === 'AUTH_TOKEN_VERSION_STALE' || errorData?.errorCode === 'AUTH_ACCOUNT_INACTIVE') {
      api.dispatch(clearCredentials());
      return result;
    }

    // Prevent infinite loop if the refresh token endpoint itself fails
    const isRefreshEndpoint = typeof args === 'string' 
      ? args.includes('/auth/refresh-token') 
      : args.url.includes('/auth/refresh-token');

    if (isRefreshEndpoint) {
      api.dispatch(clearCredentials());
      return result;
    }

    // If there is no active refresh token request in progress, start one
    if (!refreshResultPromise) {
      refreshResultPromise = (async () => {
        try {
          const refreshResult = await baseQuery(
            { url: '/auth/refresh-token', method: 'POST' },
            api,
            extraOptions
          );
          
          if (refreshResult.data) {
            const payload = refreshResult.data as {
              statusCode: number;
              message: string;
              data: {
                user: User;
                accessToken: string;
              };
            };

            // Store the new token in Redux memory
            api.dispatch(
              setCredentials({
                user: payload.data.user,
                accessToken: payload.data.accessToken,
              })
            );
          } else {
            // If refresh fails, log out the user
            api.dispatch(clearCredentials());
          }
          
          return refreshResult;
        } catch (err) {
          api.dispatch(clearCredentials());
          throw err;
        } finally {
          refreshResultPromise = null;
        }
      })();
    }

    // Wait for the active refresh to complete
    const refreshResult = await refreshResultPromise;

    if (refreshResult && refreshResult.data) {
      // Retry the original query with the new access token
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Staff', 'Product', 'Category', 'Brand', 'Unit', 'Inventory', 'Supplier', 'Purchase', 'Customer', 'Sale', 'Expense', 'ExpenseCategory', 'ShopSettings'],
  endpoints: () => ({}),
});
