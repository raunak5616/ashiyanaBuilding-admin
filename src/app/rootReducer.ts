import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/store/uiSlice';
import settingsReducer from '@/features/settings/settingsSlice';
import notificationsReducer from '@/store/notificationsSlice';
import { apiSlice } from '@/api/apiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  settings: settingsReducer,
  notifications: notificationsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
