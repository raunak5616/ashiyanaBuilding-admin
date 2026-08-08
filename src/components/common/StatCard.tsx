import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-start justify-between relative overflow-hidden group hover:border-slate-300 transition-all duration-300 select-none ${className}`}>
      <div className="flex-grow">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans leading-none mb-2.5">
          {title}
        </p>
        <h4 className="text-2xl font-black text-secondary font-heading tracking-tight leading-none mb-2">
          {value}
        </h4>
        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
              {trend.value}
            </span>
            <span className="text-slate-400 font-normal">
              vs last week
            </span>
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-slate-400 font-sans">
            {description}
          </p>
        )}
      </div>
      {icon && (
        <div className="h-11 w-11 bg-slate-50 text-slate-400 flex items-center justify-center rounded-xl border border-slate-100/80 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
