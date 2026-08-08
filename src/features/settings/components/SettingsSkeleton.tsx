import React from 'react';
import Skeleton from '@mui/material/Skeleton';

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="350px" height={20} sx={{ borderRadius: 1 }} />
      </div>

      {/* Content Form Blocks Skeletons */}
      <div className="border border-slate-200/60 rounded-2xl p-6 bg-white shadow-sm">
        <Skeleton variant="rectangular" width="120px" height={24} sx={{ mb: 4, borderRadius: 1.5 }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="100px" height={16} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={44} sx={{ borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="border border-slate-200/60 rounded-2xl p-6 bg-white shadow-sm">
        <Skeleton variant="rectangular" width="150px" height={24} sx={{ mb: 4, borderRadius: 1.5 }} />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="120px" height={16} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
