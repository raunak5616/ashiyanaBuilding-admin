import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';

import AppCard from '@/components/common/AppCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useGetCategoriesQuery } from '../../products/productApi';
import {
  useGetSlidesQuery,
  useCreateSlideMutation,
  useDeleteSlideMutation,
} from '../slidesApi';

export const SlideManagementScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  // API Queries & Mutations
  const { data: slidesResponse, isLoading: slidesLoading } = useGetSlidesQuery();
  const { data: categoriesResponse } = useGetCategoriesQuery({ isActive: true });
  const [createSlide, { isLoading: isUploading }] = useCreateSlideMutation();
  const [deleteSlide, { isLoading: isDeleting }] = useDeleteSlideMutation();

  const slides = slidesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Build category map for quick name lookups
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedCategoryId) {
        formData.append('categoryId', selectedCategoryId);
      }

      await createSlide(formData).unwrap();
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedCategoryId('');
    } catch (err) {
      console.error('Failed to upload slide:', err);
    }
  };

  const triggerDeleteConfirm = (id: string) => {
    setSlideToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (slideToDelete) {
      try {
        await deleteSlide(slideToDelete).unwrap();
      } catch (err) {
        console.error('Failed to delete slide:', err);
      } finally {
        setDeleteConfirmOpen(false);
        setSlideToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <h1 className="text-xl font-black text-secondary font-heading leading-tight">
          Homepage Banner Slides
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Upload and manage carousel images shown at the top of the mobile application homepage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1">
          <AppCard title="Upload New Banner">
            <form onSubmit={handleUpload} className="space-y-5">
              {/* File Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                  Slide Image
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[160px]">
                  {previewUrl ? (
                    <div className="w-full relative rounded-xl overflow-hidden aspect-[21/9]">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1.5 hover:bg-slate-900 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-6">
                      <CloudUploadIcon className="h-10 w-10 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-600 font-sans">
                        Click to select image file
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans mt-1">
                        Recommended aspect ratio: 21:9 (landscape)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Category Dropdown Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans block">
                  Link to Category (Optional)
                </label>
                <p className="text-[10px] text-slate-400 font-sans">
                  Tapping this slide banner in the app will redirect users to this category section.
                </p>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  displayEmpty
                  size="small"
                  className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 w-full"
                  classes={{ select: '!py-2.5 !px-3' }}
                >
                  <MenuItem value="" className="!text-xs !font-sans font-medium">
                    Do not link (Static display only)
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id} className="!text-xs !font-sans font-semibold">
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedFile || isUploading}
                variant="contained"
                disableElevation
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white capitalize font-sans text-xs font-semibold py-3 min-h-[44px]"
              >
                {isUploading ? <CircularProgress size={20} className="text-white" /> : 'Upload Banner Slide'}
              </Button>
            </form>
          </AppCard>
        </div>

        {/* Right Column: Active Slides Grid */}
        <div className="lg:col-span-2">
          <AppCard title="Active Banner Slides">
            <div className="relative min-h-[200px]">
              {slidesLoading && <LoadingOverlay message="Loading promo banners..." />}
              
              {slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <p className="text-sm font-semibold text-slate-400 font-sans">
                    No active slideshow banners found.
                  </p>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Upload an image on the left to display promo banners in the app.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slides.map((slide) => {
                    const linkedCategoryName = slide.categoryId ? categoryMap.get(slide.categoryId) : null;
                    return (
                      <div
                        key={slide.id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col"
                      >
                        {/* Slide Image */}
                        <div className="aspect-[21/9] w-full bg-slate-50 relative overflow-hidden">
                          <img src={slide.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Slide Details */}
                        <div className="p-4 flex items-center justify-between gap-4 flex-1">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">
                              {linkedCategoryName ? `Link: ${linkedCategoryName}` : 'Static Promo Banner'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-sans">
                              Uploaded: {new Date(slide.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          
                          <IconButton
                            size="small"
                            onClick={() => triggerDeleteConfirm(slide.id)}
                            className="text-rose-500 hover:bg-rose-50 rounded-xl"
                          >
                            <DeleteIcon className="h-5 w-5" />
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AppCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          title="Delete Promo Slide Banner?"
          message="Are you sure you want to permanently delete this banner? It will be removed from Cloudinary and will no longer show in the mobile app home screen."
          confirmText="Delete"
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setSlideToDelete(null);
          }}
          loading={isDeleting}
        />
      )}
    </div>
  );
};

export default SlideManagementScreen;
