import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import ProductImageUploader from './ProductImageUploader';
import {
  QuickAddCategoryDialog,
  QuickAddBrandDialog,
  QuickAddUnitDialog,
} from './QuickAddDialogs';
import {
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetUnitsQuery,
  Product,
} from '../productApi';

// Import Material UI components & icons
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import CropFreeIcon from '@mui/icons-material/CropFree';
import Snackbar from '@mui/material/Snackbar';
import BarcodeScannerModal from '@/components/barcode/BarcodeScannerModal';

// Zod Validation Schema
const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters').max(32, 'SKU cannot exceed 32 characters'),
  barcode: z.string().trim().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: z.string().min(1, 'Unit of measure is required'),
  description: z.string().trim().optional(),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
  purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative'),
  taxRate: z.coerce.number().min(0, 'GST rate must be at least 0%').max(100, 'GST rate cannot exceed 100%'),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock cannot be negative').default(0),
  currentStock: z.coerce.number().int().min(0, 'Current stock cannot be negative').optional(), // UI Only
  mrp: z.coerce.number().min(0, 'MRP cannot be negative').optional(), // UI Only
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
    altText: z.string().optional(),
  })).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const isEdit = Boolean(product);

  // Quick Add Modal States
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleScanSuccess = (barcode: string) => {
    setValue('barcode', barcode, { shouldValidate: true, shouldDirty: true });
    setScannerOpen(false);
    setToastOpen(true);

    // Focus the next form field automatically (Purchase Price input field)
    setTimeout(() => {
      const nextField = document.getElementById('purchase-price');
      if (nextField) {
        nextField.focus();
      }
    }, 150);
  };

  // Queries for selectors
  const { data: categoriesResponse } = useGetCategoriesQuery({ isActive: true });
  const { data: brandsResponse } = useGetBrandsQuery({ isActive: true });
  const { data: unitsResponse } = useGetUnitsQuery({ isActive: true });

  const categories = categoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const units = unitsResponse?.data || [];

  // Form initialization
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      brandId: '',
      unitId: '',
      description: '',
      sellingPrice: 0,
      purchasePrice: 0,
      taxRate: 18, // 18% GST default
      minimumStock: 0,
      currentStock: 0,
      mrp: 0,
      images: [],
    },
  });

  // Populate data when in edit mode
  useEffect(() => {
    if (product) {
      setValue('name', product.name || '');
      setValue('sku', product.sku || '');
      setValue('barcode', product.barcode || '');
      setValue('categoryId', product.categoryId || '');
      setValue('brandId', product.brandId || '');
      setValue('unitId', product.unitId || '');
      setValue('description', product.description || '');
      // Translate paise to Rupees
      setValue('sellingPrice', product.sellingPrice ? product.sellingPrice / 100 : 0);
      setValue('purchasePrice', product.purchasePrice ? product.purchasePrice / 100 : 0);
      setValue('mrp', product.sellingPrice ? product.sellingPrice / 100 : 0);
      setValue('taxRate', product.taxRate !== undefined ? product.taxRate : 18);
      setValue('minimumStock', product.minimumStock || 0);
      setValue('images', product.images || []);
    }
  }, [product, setValue]);

  const handleFormSubmit = async (data: ProductFormData) => {
    // Map data back: Convert prices to paise
    const payload = {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || undefined,
      categoryId: data.categoryId || undefined,
      brandId: data.brandId || undefined,
      unitId: data.unitId,
      description: data.description || undefined,
      sellingPrice: Math.round(data.sellingPrice * 100),
      purchasePrice: Math.round(data.purchasePrice * 100),
      taxRate: data.taxRate,
      minimumStock: data.minimumStock,
      images: data.images,
    };

    await onSubmit(payload);
  };



  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 font-sans select-none">
      {error && (
        <Alert severity="error" className="!rounded-2xl">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Core Product Details */}
        <div className="space-y-4">
          <FormInput
            label="Product Name"
            placeholder="e.g. PVC Conduit Pipe 25mm"
            required
            disabled={loading}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="SKU Code"
              placeholder="e.g. PVC-PIPE-25"
              required
              disabled={loading}
              error={errors.sku?.message}
              {...register('sku')}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex justify-between items-center select-none">
                <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500">
                  Barcode
                </label>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  disabled={loading}
                  className="text-xs font-bold text-primary hover:text-primary/80 select-none flex items-center gap-1 focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  <CropFreeIcon className="!h-3.5 !w-3.5" />
                  <span>Scan Barcode</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 8901234567890"
                disabled={loading}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 transition-all duration-200 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400 ${
                  errors.barcode ? '!border-rose-500 focus:!ring-rose-500' : ''
                }`}
                {...register('barcode')}
              />
              {errors.barcode && (
                <p className="text-xs font-semibold text-rose-500 font-sans mt-0.5 select-none animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.barcode.message}
                </p>
              )}
            </div>
          </div>

          {/* Classification selects with quick-add buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Select */}
            <FormControl fullWidth error={Boolean(errors.categoryId)} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Category</span>
                <IconButton
                  size="small"
                  onClick={() => setCategoryOpen(true)}
                  disabled={loading}
                  className="hover:bg-slate-100 !p-0.5"
                >
                  <AddIcon className="h-3.5 w-3.5 text-primary" />
                </IconButton>
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    disabled={loading}
                    className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="" className="!text-xs !font-sans text-slate-400">
                      Select Category...
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id} className="!text-xs !font-sans">
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
            </FormControl>

            {/* Brand Select */}
            <FormControl fullWidth error={Boolean(errors.brandId)} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Brand</span>
                <IconButton
                  size="small"
                  onClick={() => setBrandOpen(true)}
                  disabled={loading}
                  className="hover:bg-slate-100 !p-0.5"
                >
                  <AddIcon className="h-3.5 w-3.5 text-primary" />
                </IconButton>
              </label>
              <Controller
                name="brandId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    disabled={loading}
                    className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="" className="!text-xs !font-sans text-slate-400">
                      Select Brand...
                    </MenuItem>
                    {brands.map((br) => (
                      <MenuItem key={br.id} value={br.id} className="!text-xs !font-sans">
                        {br.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.brandId && <FormHelperText>{errors.brandId.message}</FormHelperText>}
            </FormControl>

            {/* Unit Select */}
            <FormControl fullWidth error={Boolean(errors.unitId)} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Unit of Measure *</span>
                <IconButton
                  size="small"
                  onClick={() => setUnitOpen(true)}
                  disabled={loading}
                  className="hover:bg-slate-100 !p-0.5"
                >
                  <AddIcon className="h-3.5 w-3.5 text-primary" />
                </IconButton>
              </label>
              <Controller
                name="unitId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    displayEmpty
                    required
                    disabled={loading}
                    className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="" disabled className="!text-xs !font-sans text-slate-400">
                      Select Unit...
                    </MenuItem>
                    {units.map((un) => (
                      <MenuItem key={un.id} value={un.id} className="!text-xs !font-sans">
                        {un.name} ({un.abbreviation})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.unitId && <FormHelperText>{errors.unitId.message}</FormHelperText>}
            </FormControl>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
              Product Description
            </label>
            <textarea
              placeholder="Provide technical specifications, dimensions, material types..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 transition-all duration-200 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs font-semibold text-rose-500 font-sans mt-0.5">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Tax, Stock & Images */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="purchase-price"
              label="Purchase Price (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 120.00"
              required
              disabled={loading}
              error={errors.purchasePrice?.message}
              {...register('purchasePrice')}
            />

            <FormInput
              label="Selling Price (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 150.00"
              required
              disabled={loading}
              error={errors.sellingPrice?.message}
              {...register('sellingPrice')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="MRP (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 180.00"
              disabled={loading}
              error={errors.mrp?.message}
              {...register('mrp')}
            />

            <FormInput
              label="GST Rate (%)"
              type="number"
              placeholder="e.g. 18"
              required
              disabled={loading}
              error={errors.taxRate?.message}
              {...register('taxRate')}
            />

            <FormInput
              label="Min Stock"
              type="number"
              placeholder="e.g. 10"
              disabled={loading}
              error={errors.minimumStock?.message}
              {...register('minimumStock')}
            />
          </div>

          <FormInput
            label="Current Stock"
            type="number"
            placeholder="Counts managed via Inventory module"
            disabled={true} // Informational field as stock is out of catalog scope
            error={errors.currentStock?.message}
            {...register('currentStock')}
          />

          {/* Product Image Uploader */}
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <ProductImageUploader
                images={field.value}
                onChange={field.onChange}
                disabled={loading}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <SecondaryButton type="button" onClick={onCancel} disabled={loading} className="!py-2.5 !px-5">
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" loading={loading} className="!py-2.5 !px-5">
          {isEdit ? 'Save Changes' : 'Add Product'}
        </PrimaryButton>
      </div>

      {/* Quick Add Dialogs */}
      {categoryOpen && (
        <QuickAddCategoryDialog
          open={categoryOpen}
          onClose={() => setCategoryOpen(false)}
          onSuccess={(newId) => setValue('categoryId', newId)}
        />
      )}

      {brandOpen && (
        <QuickAddBrandDialog
          open={brandOpen}
          onClose={() => setBrandOpen(false)}
          onSuccess={(newId) => setValue('brandId', newId)}
        />
      )}

      {unitOpen && (
        <QuickAddUnitDialog
          open={unitOpen}
          onClose={() => setUnitOpen(false)}
          onSuccess={(newId) => setValue('unitId', newId)}
        />
      )}

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <BarcodeScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Success Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} className="!rounded-xl shadow-lg !text-xs">
          Barcode scanned successfully.
        </Alert>
      </Snackbar>
    </form>
  );
};

export default ProductForm;
