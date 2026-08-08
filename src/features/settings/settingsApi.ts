import { apiSlice } from '@/api/apiSlice';
import { ApiResponse } from '../auth/authApi';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ShopAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface TaxConfiguration {
  defaultTaxRate?: number;
  taxBrackets?: number[];
}

export interface LogoConfig {
  url?: string | null;
  publicId?: string | null;
}

export interface BackupConfig {
  lastBackupAt?: string | null;
  frequency?: 'daily' | 'weekly' | 'monthly';
  status?: string;
}

export interface ShopSettings {
  shopId: string;
  businessName: string;
  email?: string;
  phone?: string;
  address?: ShopAddress | null;
  plan?: string;
  limits?: Record<string, unknown>;
  currency?: string;
  timeZone?: string;
  dateFormat?: string;
  invoicePrefix?: string;
  invoiceStartingNumber?: number;
  purchaseOrderPrefix?: string;
  lowStockThresholdDefault?: number;
  gstNumber?: string | null;
  panNumber?: string | null;
  taxConfiguration?: TaxConfiguration;
  logo?: LogoConfig;
  backupConfig?: BackupConfig;
  updatedAt?: string;
}

export interface UpdateSettingsPayload {
  businessName?: string;
  email?: string;
  phone?: string;
  address?: ShopAddress;
  currency?: string;
  timeZone?: string;
  dateFormat?: string;
  invoicePrefix?: string;
  invoiceStartingNumber?: number;
  purchaseOrderPrefix?: string;
  lowStockThresholdDefault?: number;
  gstNumber?: string | null;
  panNumber?: string | null;
  taxConfiguration?: TaxConfiguration;
  logo?: LogoConfig;
  backupConfig?: BackupConfig;
}

// ─── API Slice ─────────────────────────────────────────────────────────────────

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<ApiResponse<ShopSettings>, void>({
      query: () => ({ url: '/settings', method: 'GET' }),
      providesTags: ['ShopSettings'],
    }),
    updateSettings: builder.mutation<ApiResponse<ShopSettings>, UpdateSettingsPayload>({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: ['ShopSettings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
