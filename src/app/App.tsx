import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRefreshMutation } from '@/features/auth/authApi';
import { clearCredentials } from '@/features/auth/authSlice';
import { RootState } from '@/app/rootReducer';
import AppRoutes from './AppRoutes';
import getTheme from '@/theme/theme';
import LoadingPage from '@/components/common/LoadingPage';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await refresh().unwrap();
      } catch (error) {
        // If refresh fails on startup, clear credentials to transition from undefined to unauthenticated
        dispatch(clearCredentials());
      }
    };
    checkSession();
  }, [refresh, dispatch]);

  // Synchronize dark class on document element for Tailwind dark utility styles
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  if (!isInitialized) {
    return <LoadingPage message="Initializing application..." />;
  }

  return (
    <ThemeProvider theme={getTheme(themeMode)}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
