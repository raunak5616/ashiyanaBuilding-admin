import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Please wait...' }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] select-none rounded-xl animate-in fade-in duration-200">
      <CircularProgress size={28} className="!text-secondary" />
      {message && (
        <span className="mt-2.5 text-xs font-semibold text-slate-500 font-sans tracking-wide">
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingOverlay;
