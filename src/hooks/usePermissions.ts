import { useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isOwner || user.role?.slug === 'owner') return true;

    const roleSlug = user.role?.slug;
    if (!roleSlug) return false;

    const permissions = ROLE_PERMISSIONS[roleSlug] || [];
    return permissions.includes(permission) || permissions.includes('*');
  };

  return {
    hasPermission,
    role: user?.role?.slug,
    isOwner: user?.isOwner || user?.role?.slug === 'owner',
  };
};
