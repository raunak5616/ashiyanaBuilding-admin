import React from 'react';
import Avatar from '@mui/material/Avatar';
import { THEME_CONSTANTS } from '@/constants/themeConstants';

interface ProfileAvatarProps {
  fullName: string;
  src?: string;
  size?: number;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  fullName,
  src,
  size = 80,
  className = '',
}) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Avatar
      src={src || undefined}
      alt={fullName}
      className={`premium-shadow transition-all duration-300 font-heading font-black select-none ${className}`}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        bgcolor: src ? 'transparent' : THEME_CONSTANTS.COLORS.PRIMARY,
        color: src ? 'inherit' : THEME_CONSTANTS.COLORS.SECONDARY,
        border: `2px solid ${THEME_CONSTANTS.COLORS.BORDER}`,
        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.06)',
      }}
    >
      {getInitials(fullName)}
    </Avatar>
  );
};

export default ProfileAvatar;
