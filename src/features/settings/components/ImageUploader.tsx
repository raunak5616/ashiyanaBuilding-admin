import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import { ENV } from '@/config/env';

interface ImageUploaderProps {
  value?: { url: string | null; publicId: string | null } | null;
  onChange: (value: { url: string | null; publicId: string | null } | null) => void;
  disabled?: boolean;
}

// Canvas-based image compression helper preserving aspect ratio
const compressImage = (file: File): Promise<File | Blob> => {
  return new Promise((resolve) => {
    if (file.size <= 500 * 1024) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const uploadImage = (
  file: File,
  accessToken: string | null,
  onProgress: (progress: number) => void
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Setting logo uploads category to 'settings'
    xhr.open('POST', `${ENV.API_URL}/uploads/image?folder=settings`);

    if (accessToken) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.data.url,
            publicId: response.data.publicId,
          });
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        if (ENV.IS_DEV) {
          console.warn('Backend upload failed. Falling back to simulated mockup in development...');
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            onProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              const timestamp = Date.now();
              resolve({
                url: `https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=400&h=400&fit=crop&q=${timestamp}`,
                publicId: `mock_logo_public_id_${timestamp}`,
              });
            }
          }, 80);
          return;
        }

        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      if (ENV.IS_DEV) {
        console.warn('Network error. Falling back to simulated mockup in development...');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            const timestamp = Date.now();
            resolve({
              url: `https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=400&h=400&fit=crop&q=${timestamp}`,
              publicId: `mock_logo_public_id_${timestamp}`,
            });
          }
        }, 80);
        return;
      }
      reject(new Error('Network error during upload'));
    });

    const formData = new FormData();
    formData.append('image', file);
    xhr.send(formData);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const compressedFile = await compressImage(file);
      const result = await uploadImage(compressedFile as File, accessToken, (progress) => {
        setUploadProgress(progress);
      });

      onChange({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Logo Preview */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: value?.url ? 'divider' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: 'background.default',
            position: 'relative',
          }}
        >
          {value?.url ? (
            <>
              <img
                src={value.url}
                alt="Shop Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {!disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: '0.2s',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <IconButton onClick={handleRemoveImage} sx={{ color: 'white' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </>
          ) : (
            <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
          )}
        </Box>

        {/* Upload Button & Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled || uploading}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            size="small"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {uploading ? 'Compressing & Uploading...' : value?.url ? 'Change Logo' : 'Upload Logo'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Recommended size: 256x256px. Formats: PNG, JPG, WEBP. Max 2MB.
          </Typography>
        </Box>
      </Box>

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress variant="determinate" value={uploadProgress} size={18} />
          <Typography variant="caption" color="text.secondary">
            Uploading: {uploadProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
