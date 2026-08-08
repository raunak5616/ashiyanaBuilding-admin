import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import AppCard from '@/components/common/AppCard';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <AppCard className="!p-6 border border-slate-200/60 shadow-sm select-none">
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="text" width={180} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={280} height={18} sx={{ borderRadius: 1 }} />
        </div>
      </AppCard>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column Profile Summary Skeleton */}
        <div className="md:col-span-4">
          <AppCard className="flex flex-col items-center text-center p-6 space-y-6">
            <Skeleton variant="circular" width={110} height={110} />
            <div className="w-full flex flex-col items-center gap-1.5">
              <Skeleton variant="text" width="60%" height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width="40%" height={18} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="30%" height={24} sx={{ borderRadius: 1.5, mt: 1 }} />
            </div>
            <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
            </div>
          </AppCard>
        </div>

        {/* Right Column Profile Details Skeleton */}
        <div className="md:col-span-8 space-y-6">
          {/* Nav Tabs Skeleton */}
          <AppCard className="!py-3 !px-4 flex gap-4 overflow-x-auto flex-nowrap scrollbar-none">
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={110} height={32} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1.5 }} />
          </AppCard>

          {/* Information Grid Skeleton */}
          <AppCard title="Personal Information" subtitle="Primary contact and identification details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/20">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1 flex flex-col gap-1">
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </div>
                </div>
              ))}
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
