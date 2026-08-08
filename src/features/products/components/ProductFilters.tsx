import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useGetCategoriesQuery, useGetBrandsQuery } from '../productApi';

interface ProductFiltersProps {
  categoryId: string;
  onCategoryChange: (value: string) => void;
  brandId: string;
  onBrandChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'archived';
  onStatusChange: (value: 'all' | 'active' | 'archived') => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categoryId,
  onCategoryChange,
  brandId,
  onBrandChange,
  statusFilter,
  onStatusChange,
}) => {
  // Fetch active categories & brands for filtering
  const { data: categoriesResponse } = useGetCategoriesQuery({ isActive: true });
  const { data: brandsResponse } = useGetBrandsQuery({ isActive: true });

  const categories = categoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];

  return (
    <div className="flex flex-wrap items-center gap-4 select-none">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category:</span>
        <Select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          size="small"
          className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-40"
          classes={{ select: '!py-1.5 !px-3' }}
        >
          <MenuItem value="all" className="!text-xs !font-sans font-medium">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id} className="!text-xs !font-sans">
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Brand Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand:</span>
        <Select
          value={brandId}
          onChange={(e) => onBrandChange(e.target.value)}
          size="small"
          className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-40"
          classes={{ select: '!py-1.5 !px-3' }}
        >
          <MenuItem value="all" className="!text-xs !font-sans font-medium">All Brands</MenuItem>
          {brands.map((br) => (
            <MenuItem key={br.id} value={br.id} className="!text-xs !font-sans">
              {br.name}
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as any)}
          size="small"
          className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-32"
          classes={{ select: '!py-1.5 !px-3' }}
        >
          <MenuItem value="all" className="!text-xs !font-sans font-medium">All Status</MenuItem>
          <MenuItem value="active" className="!text-xs !font-sans text-emerald-600 font-semibold">Active</MenuItem>
          <MenuItem value="archived" className="!text-xs !font-sans text-rose-500 font-semibold">Archived</MenuItem>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;
