import React from 'react';

interface StatusChipProps {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'default' | boolean;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  status,
  className = '',
}) => {
  const normalizedStatus = typeof status === 'boolean' 
    ? (status ? 'success' : 'error') 
    : status;

  const colorClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-100/80',
    error: 'bg-rose-50 text-rose-700 border-rose-100/80',
    info: 'bg-sky-50 text-sky-700 border-sky-100/80',
    default: 'bg-slate-50 text-slate-700 border-slate-100/80',
  };

  const activeClass = colorClasses[normalizedStatus] || colorClasses.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none font-sans leading-none ${activeClass} ${className}`}>
      {label}
    </span>
  );
};

export default StatusChip;
