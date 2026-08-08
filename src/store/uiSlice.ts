import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export interface UiState {
  sidebarCollapsed: boolean;
  globalLoading: boolean;
  globalLoadingMessage?: string;
}

const initialState: UiState = {
  sidebarCollapsed: localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true',
  globalLoading: false,
  globalLoadingMessage: undefined,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(action.payload));
    },
    showLoading: (state, action: PayloadAction<string | undefined>) => {
      state.globalLoading = true;
      state.globalLoadingMessage = action.payload;
    },
    hideLoading: (state) => {
      state.globalLoading = false;
      state.globalLoadingMessage = undefined;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, showLoading, hideLoading } = uiSlice.actions;
export default uiSlice.reducer;
