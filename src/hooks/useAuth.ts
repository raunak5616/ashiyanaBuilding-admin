import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import { clearCredentials } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const [logoutMutation] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Failed to logout on backend, clearing client session anyway:', error);
    } finally {
      dispatch(clearCredentials());
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    logout,
  };
};
