import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/app/rootReducer';
import { apiSlice } from '@/api/apiSlice';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
