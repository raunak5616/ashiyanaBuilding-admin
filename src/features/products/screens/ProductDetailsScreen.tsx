import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppCard from '@/components/common/AppCard';
import SecondaryButton from '@/components/common/SecondaryButton';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import ProductStatusChip from '../components/ProductStatusChip';
import {
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetUnitsQuery,
} from '../productApi';

export const ProductDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: productResponse, isLoading, isError, error } = useGetProductByIdQuery(id || '');
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: brandsResponse } = useGetBrandsQuery();
  const { data: unitsResponse } = useGetUnitsQuery();

  const product = productResponse?.data;
  const categories = categoriesResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const units = unitsResponse?.data || [];

  // Lookups maps
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));
  const unitMap = new Map(units.map((u) => [u.id, `${u.name} (${u.abbreviation})`]));

  // Selected Image Index for gallery
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  if (isLoading) {
    return <LoadingPage message="Loading product information..." />;
  }

  if (isError || !product) {
    return (
      <ErrorPage
        title="Product Not Found"
        message={
          (error as any)?.data?.message ||
          'The product details could not be retrieved from the database. Please verify the ID.'
        }
      />
    );
  }

  // Margin/Markup calculations
  const profitMargin = product.sellingPrice - product.purchasePrice;
  const marginPercent = product.sellingPrice > 0 ? (profitMargin / product.sellingPrice) * 100 : 0;
  const markupPercent = product.purchasePrice > 0 ? (profitMargin / product.purchasePrice) * 100 : 0;

  const images = product.images || [];
  const activeImage = images[selectedImgIdx]?.url || null;

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      {/* Back Header Nav */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <SecondaryButton
          onClick={() => navigate('/products')}
          className="!py-2 !px-3.5 !rounded-xl !text-xs"
        >
          <div className="flex items-center gap-1.5">
            <ArrowBackIcon className="h-4 w-4 text-slate-500" />
            <span>Back to Products</span>
          </div>
        </SecondaryButton>

        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-secondary tracking-tight">
            Product SKU: <span className="font-mono font-black text-primary uppercase">{product.sku}</span>
          </h1>
          <ProductStatusChip isActive={product.isActive} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery Card (cols: 5) */}
        <div className="lg:col-span-5 space-y-4">
          <AppCard className="!p-4 flex flex-col items-center justify-between min-h-[420px]">
            {/* Active Display Panel */}
            <div className="w-full flex-1 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 min-h-[300px]">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full max-h-[280px] object-contain transition-all duration-300"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-4xl block mb-2">📦</span>
                  <p className="text-xs font-bold">No product images uploaded</p>
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="w-full mt-4 flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={img.publicId || idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`w-14 h-14 border rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 p-0.5 transition-all cursor-pointer ${
                      selectedImgIdx === idx
                        ? 'border-primary ring-2 ring-primary/25 shadow-mdScale'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </AppCard>
        </div>

        {/* Right Column: Pricing & Meta details (cols: 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Core Info Summary Card */}
          <AppCard className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Product Title
              </span>
              <h2 className="text-xl font-black text-secondary leading-snug">{product.name}</h2>
            </div>

            {product.description && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Technical Specifications & Description
                </span>
                <p className="text-xs text-slate-500 font-sans leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Barcode
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {product.barcode || '—'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Category
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {categoryMap.get(product.categoryId || '') || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Brand
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {brandMap.get(product.brandId || '') || 'Unassigned'}
                </span>
              </div>
            </div>
          </AppCard>

          {/* Pricing Metrics Grid Card */}
          <AppCard className="!p-0 overflow-hidden border border-slate-200/60 shadow-sm rounded-2xl">
            <div className="bg-[#FAFAFA] p-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 font-sans">
                Financials & Pricing Matrix
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 border px-2 py-0.5 rounded-md font-sans">
                Unit: {unitMap.get(product.unitId || '') || '—'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Financial values */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Purchase Price
                  </span>
                  <span className="text-lg font-black text-slate-700 font-mono">
                    ₹{(product.purchasePrice / 100).toFixed(2)}
                  </span>
                </div>

                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <span className="text-[9px] font-bold text-primary/80 uppercase tracking-widest block mb-1">
                    Selling Price
                  </span>
                  <span className="text-lg font-black text-primary font-mono">
                    ₹{(product.sellingPrice / 100).toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    GST Rate
                  </span>
                  <span className="text-lg font-black text-slate-700 font-sans">
                    {product.taxRate}%
                  </span>
                </div>
              </div>

              {/* Profitability indicators */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Net Profit Margin
                  </span>
                  <span className="text-sm font-black text-emerald-600 font-mono block">
                    +₹{(profitMargin / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Per Unit</span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Profit Margin (%)
                  </span>
                  <span className="text-sm font-black text-emerald-600 font-sans block">
                    {marginPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Of Selling Price</span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                    Markup (%)
                  </span>
                  <span className="text-sm font-black text-emerald-600 font-sans block">
                    {markupPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Over Cost Price</span>
                </div>
              </div>
            </div>
          </AppCard>

          {/* Configuration and Threshold limits card */}
          <AppCard className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                Minimum Stock Limit
              </span>
              <span className="text-sm font-extrabold text-slate-700 font-mono">
                {product.minimumStock || 0} units
              </span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-normal">
                Trigger inventory alerts when stock counts fall below this threshold.
              </p>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                Created Date
              </span>
              <span className="text-sm font-extrabold text-slate-700 font-mono">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-normal">
                Cataloged into system. Last modified: {new Date(product.updatedAt).toLocaleDateString()}.
              </p>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsScreen;
