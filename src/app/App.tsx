import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRefreshMutation } from '@/features/auth/authApi';
import { clearCredentials } from '@/features/auth/authSlice';
import { RootState } from '@/app/rootReducer';
import AppRoutes from './AppRoutes';
import theme from '@/theme/theme';
import LoadingPage from '@/components/common/LoadingPage';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state: RootState) => state.auth);
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

  if (!isInitialized) {
    return <LoadingPage message="Initializing application..." />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
