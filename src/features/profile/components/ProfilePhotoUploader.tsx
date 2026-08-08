import React from 'react';
import UploadAvatar from './UploadAvatar';
import { useUploadProfilePhotoMutation, useUpdateProfileMutation } from '../profileApi';

interface ProfilePhotoUploaderProps {
  fullName: string;
  currentPhotoUrl?: string;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
  disabled?: boolean;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  fullName,
  currentPhotoUrl,
  onSuccessToast,
  onErrorToast,
  disabled = false,
}) => {
  const [uploadProfilePhoto, { isLoading: isUploading }] = useUploadProfilePhotoMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleFileSelect = async (file: File) => {
    // 1. File Type Validation
    const allowedExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedExtensions.includes(file.type)) {
      onErrorToast('Unsupported file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
      return;
    }

    // 2. File Size Validation (Max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onErrorToast('File size exceeds the maximum limit of 5MB.');
      return;
    }

    // 3. Form Data Construction & Upload mutation
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Step A: Upload to Cloudinary via backend
      const uploadRes = await uploadProfilePhoto(formData).unwrap();
      const { url, publicId } = uploadRes.data;

      // Step B: Save profile photo Cloudinary coordinates into user document
      await updateProfile({
        profilePhoto: { url, publicId },
      }).unwrap();

      onSuccessToast('Profile photo updated successfully.');
    } catch (err: any) {
      onErrorToast(
        err?.data?.message || 'Failed to upload profile photo. Please try again.'
      );
    }
  };

  return (
    <UploadAvatar
      fullName={fullName}
      src={currentPhotoUrl}
      onFileSelect={handleFileSelect}
      isUploading={isUploading || isUpdating}
      disabled={disabled}
      size={110}
    />
  );
};

export default ProfilePhotoUploader;
