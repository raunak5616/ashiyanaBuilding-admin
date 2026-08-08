import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants/routes';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';

interface ProtectedRoutesProps {
  children: React.ReactElement;
  requiredPermission?: string;
}

export const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login but keep location history so we can return
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <ErrorPage
        status={403}
        title="Permission Denied"
        message="You do not have the required administrative permissions to access this feature."
      />
    );
  }

  return children;
};

export default ProtectedRoutes;
