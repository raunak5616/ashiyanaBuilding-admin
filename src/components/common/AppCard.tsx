import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 select-none">
          <div>
            {title && (
              <h3 className="text-sm font-black text-secondary font-heading leading-tight uppercase tracking-wider">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default AppCard;
