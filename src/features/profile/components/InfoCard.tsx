import React from 'react';

interface InfoCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-all duration-300 hover:bg-slate-50 hover:border-slate-200/80 ${className}`}>
      {icon && (
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-slate-200/50 text-slate-500 shrink-0 shadow-sm">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5 select-none">
          {label}
        </p>
        <div className="text-sm font-semibold text-slate-800 break-words leading-snug">
          {value || <span className="text-slate-400 font-normal italic">Not Provided</span>}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
