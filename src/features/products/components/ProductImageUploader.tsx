import React, { useState, useRef } from 'react';
import ImagePreviewCard from './ImagePreviewCard';
import { ProductImage } from '../productApi';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import { ENV } from '@/config/env';

interface ProductImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

// Canvas-based image compression helper preserving aspect ratio
const compressImage = (file: File): Promise<File | Blob> => {
  return new Promise((resolve) => {
    // Only compress images larger than 500KB
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

// Image upload helper supporting direct backend uploads with development fallback
const uploadImage = (
  file: File,
  folder: string,
  accessToken: string | null,
  onProgress: (progress: number) => void
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ENV.API_URL}/uploads/image?folder=${folder}`);

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
        // Fallback to simulated upload in local development if backend upload fails
        // (This preserves client usability even if Cloudinary is not configured on the local backend instance)
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
                url: `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=${timestamp}`,
                publicId: `mock_cloudinary_public_id_${timestamp}`,
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
              url: `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=${timestamp}`,
              publicId: `mock_cloudinary_public_id_${timestamp}`,
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

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // HTML5 Draggable item tracker
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // File Upload handlers
  const processFiles = async (files: FileList) => {
    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    const uploadedImages: ProductImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Basic image validation
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }

        // Compress image before upload
        const compressedFile = await compressImage(file);
        
        // Upload to backend API
        const result = await uploadImage(compressedFile as File, 'products', accessToken, (progress) => {
          // Average the progress across multiple files if needed
          const relativeProgress = Math.round(((i + progress / 100) / files.length) * 100);
          setUploadProgress(relativeProgress);
        });

        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          altText: file.name.substring(0, 50),
        });
      }

      // Add to existing list of images
      onChange([...images, ...uploadedImages]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err?.message || 'Failed to upload one or more images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOverZone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropZone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  // HTML5 Drag and Drop handlers for list reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (disabled || uploading) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, _index: number) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...images];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    
    onChange(reordered);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Product Images
      </label>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOverZone}
        onDrop={handleDropZone}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          uploading
            ? 'border-primary/40 bg-primary/5 cursor-wait'
            : disabled
            ? 'border-slate-200 bg-slate-50/50 cursor-not-allowed text-slate-400'
            : 'border-slate-300 hover:border-primary hover:bg-slate-50/40 text-slate-500'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <CircularProgress variant="determinate" value={uploadProgress} size={36} className="text-primary" />
            <p className="text-xs font-bold text-slate-600">Uploading Images... {uploadProgress}%</p>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
            <CloudUploadIcon className={`h-8 w-8 ${disabled ? 'text-slate-300' : 'text-slate-400 group-hover:text-primary'}`} />
            <p className="text-xs font-bold text-slate-700">Drag & drop product images here, or click to browse</p>
            <p className="text-[10px] text-slate-400">Supports multiple JPG, PNG, WEBP. Max resolution 1200x1200px (auto-compressed).</p>
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert severity="error" className="!rounded-xl !text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* Previews grid */}
      {images.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-400 font-medium">
            💡 Drag & drop thumbnails to reorder. The first image will be set as the main thumbnail.
          </p>
          <div className="flex flex-wrap gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
            {images.map((img, idx) => (
              <ImagePreviewCard
                key={img.publicId || idx}
                url={img.url}
                altText={img.altText}
                index={idx}
                onRemove={handleRemoveImage}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
