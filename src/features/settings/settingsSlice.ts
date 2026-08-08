import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export interface ClientSettings {
  // General details (client-only fields)
  ownerName: string;
  website: string;

  // Invoice settings
  invoiceFooter: string;
  termsAndConditions: string;
  invoiceNotes: string;
  showLogo: boolean;
  showGst: boolean;
  showSignature: boolean;
  autoInvoiceNumber: boolean;

  // Tax settings
  gstEnabled: boolean;
  inclusiveExclusiveTax: 'inclusive' | 'exclusive';

  // Inventory settings
  negativeStockAllowed: boolean;
  barcodeEnabled: boolean;
  skuAutoGenerate: boolean;

  // Notifications settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  orderAlerts: boolean;

  // Security settings
  sessionTimeout: number; // in minutes
  twoFactorAuthentication: boolean;
}

export interface SettingsState {
  themeMode: 'light' | 'dark';
  clientSettings: ClientSettings;
}

const DEFAULT_CLIENT_SETTINGS: ClientSettings = {
  ownerName: 'Raunak Kumar',
  website: 'https://ashiyanabuilding.com',
  invoiceFooter: 'Thank you for your business!',
  termsAndConditions: '1. Goods once sold will not be taken back.\n2. Subject to Jaipur jurisdiction.',
  invoiceNotes: 'Please pay within 7 days of receiving the invoice.',
  showLogo: true,
  showGst: true,
  showSignature: true,
  autoInvoiceNumber: true,
  gstEnabled: true,
  inclusiveExclusiveTax: 'exclusive',
  negativeStockAllowed: false,
  barcodeEnabled: false,
  skuAutoGenerate: true,
  emailNotifications: true,
  smsNotifications: false,
  lowStockAlerts: true,
  orderAlerts: true,
  sessionTimeout: 30,
  twoFactorAuthentication: false,
};

const getStoredClientSettings = (): ClientSettings => {
  try {
    const stored = localStorage.getItem('ashiyana_client_settings');
    if (stored) {
      return { ...DEFAULT_CLIENT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load client settings', e);
  }
  return DEFAULT_CLIENT_SETTINGS;
};

const initialState: SettingsState = {
  themeMode: (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'light' | 'dark') || 'light',
  clientSettings: getStoredClientSettings(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, action.payload);
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, state.themeMode);
    },
    updateClientSettings: (state, action: PayloadAction<Partial<ClientSettings>>) => {
      state.clientSettings = {
        ...state.clientSettings,
        ...action.payload,
      };
      localStorage.setItem('ashiyana_client_settings', JSON.stringify(state.clientSettings));
    },
    resetClientSettings: (state) => {
      state.clientSettings = DEFAULT_CLIENT_SETTINGS;
      localStorage.setItem('ashiyana_client_settings', JSON.stringify(DEFAULT_CLIENT_SETTINGS));
    },
  },
});

export const { setThemeMode, toggleThemeMode, updateClientSettings, resetClientSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
