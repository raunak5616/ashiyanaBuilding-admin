import React, { useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CameraIcon from '@mui/icons-material/PhotoCameraOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import ProfileAvatar from './ProfileAvatar';
import { THEME_CONSTANTS } from '@/constants/themeConstants';

interface UploadAvatarProps {
  fullName: string;
  src?: string;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
  size?: number;
}

export const UploadAvatar: React.FC<UploadAvatarProps> = ({
  fullName,
  src,
  onFileSelect,
  isUploading = false,
  disabled = false,
  size = 110,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input value so same file can be selected again if needed
    event.target.value = '';
  };

  return (
    <div className="relative inline-block select-none group">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Avatar Container with hover trigger */}
      <div
        onClick={handleAvatarClick}
        style={{ width: size, height: size }}
        className={`relative rounded-full overflow-hidden transition-all duration-300 border-2 border-slate-200/80 shadow-sm ${
          disabled || isUploading
            ? 'cursor-not-allowed'
            : 'cursor-pointer hover:border-primary hover:shadow-md hover:scale-[1.02]'
        }`}
      >
        <ProfileAvatar fullName={fullName} src={src} size={size} className="!border-0" />

        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <CircularProgress size={24} sx={{ color: THEME_CONSTANTS.COLORS.PRIMARY }} />
          </div>
        )}

        {/* Hover Action Overlay */}
        {!disabled && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <CameraIcon className="text-white h-5 w-5" />
          </div>
        )}
      </div>

      {/* Lock Badge if permissions are missing */}
      {disabled && (
        <div 
          className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm z-20"
          title="Profile photo update requires product manager permissions"
        >
          <LockIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
};

export default UploadAvatar;
