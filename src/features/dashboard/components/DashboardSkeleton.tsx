import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl"></div>
      </div>

      {/* KPI Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex justify-between">
            <div className="space-y-2.5 flex-grow">
              <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
              <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
              <div className="h-3.5 w-32 bg-slate-100 rounded-md"></div>
            </div>
            <div className="h-11 w-11 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-80 flex flex-col">
            <div className="flex justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-16 bg-slate-100 rounded-md"></div>
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed"></div>
          </div>
        ))}
      </div>

      {/* Tables and Widgets Skeleton Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales/Purchases */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-64 flex flex-col">
            <div className="h-4 w-40 bg-slate-200 rounded-md mb-6"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-slate-100 rounded-md"></div>
              <div className="h-8 bg-slate-50 rounded-md"></div>
              <div className="h-8 bg-slate-100 rounded-md"></div>
              <div className="h-8 bg-slate-50 rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Side Widgets (Low Stock / entity counts) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-64 flex flex-col">
            <div className="h-4 w-28 bg-slate-200 rounded-md mb-6"></div>
            <div className="flex-1 space-y-3.5">
              <div className="h-10 bg-slate-50 rounded-xl flex items-center justify-between px-3">
                <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-6 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl flex items-center justify-between px-3">
                <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-6 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl flex items-center justify-between px-3">
                <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-6 bg-slate-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
