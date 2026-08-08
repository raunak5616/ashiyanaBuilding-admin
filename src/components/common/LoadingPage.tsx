import React from 'react';

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white select-none">
      <div className="relative flex items-center justify-center">
        {/* Animated outer loading ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800/80 border-t-primary"></div>
        {/* Pulsing inner branding symbol */}
        <span className="absolute text-xl font-black text-primary font-heading animate-pulse">A</span>
      </div>
      <h3 className="mt-6 text-sm font-bold tracking-widest text-slate-200 font-sans uppercase">
        {message}
      </h3>
      <p className="mt-2 text-xs tracking-wider text-slate-500 font-sans">
        Aashiyana Building Materials
      </p>
    </div>
  );
};

export default LoadingPage;
