import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: {
    id: string;
    name: string;
    slug: string;
  };
  isOwner: boolean;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
