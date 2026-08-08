import React from 'react';
import AppCard from '@/components/common/AppCard';
import { useGetLowStockProductsQuery } from '../dashboardApi';
import CircularProgress from '@mui/material/CircularProgress';
import WarningIcon from '@mui/icons-material/WarningOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';

export const LowStockWidget: React.FC = () => {
  const { data, isLoading, error } = useGetLowStockProductsQuery({ page: 1, limit: 5 });

  const items = data?.data || [];

  return (
    <AppCard 
      title="Low Stock Alert" 
      subtitle="Items running below safety stock levels"
      className="h-full border-amber-100/70"
    >
      <div className="flex flex-col h-[260px] justify-between">
        {isLoading ? (
          <div className="flex items-center justify-center flex-grow">
            <CircularProgress size={20} className="!text-amber-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-grow text-[11px] text-rose-500 font-medium font-sans">
            Failed to load stock levels
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-2.5 flex-grow overflow-y-auto pr-1">
            {items.map((item) => (
              <div 
                key={item._id} 
                className="flex items-center justify-between p-2.5 bg-amber-50/20 border border-amber-100/60 rounded-xl font-sans"
              >
                <div className="space-y-0.5 max-w-[65%]">
                  <h4 className="text-[11px] font-bold text-slate-800 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    SKU: {item.sku}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100/80 leading-none">
                    <WarningIcon className="!h-2.5 !w-2.5" />
                    <span>{item.currentStock} left</span>
                  </span>
                  <p className="text-[8px] text-slate-400 font-bold mt-1">
                    Min Req: {item.minimumStock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow text-center select-none py-4">
            <div className="h-9 w-9 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
              <CheckCircleIcon className="!h-5 !w-5" />
            </div>
            <h4 className="text-[11px] font-bold text-slate-700 font-sans">Fully Stocked</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] font-sans leading-relaxed">
              No products are currently running below their minimum limits.
            </p>
          </div>
        )}
      </div>
    </AppCard>
  );
};

export default LowStockWidget;
