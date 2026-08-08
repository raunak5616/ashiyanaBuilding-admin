import React, { forwardRef, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, variant = 'light', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputClasses = 
      variant === 'dark'
        ? 'bg-slate-800/30 border-slate-800 text-white placeholder-slate-500 focus:border-primary focus:ring-primary'
        : 'bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className={`text-xs font-bold uppercase tracking-wider font-sans select-none ${
            variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full pl-4 pr-12 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 transition-all duration-200 ${inputClasses} ${
              error ? '!border-rose-500 focus:!ring-rose-500' : ''
            }`}
            {...props}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors focus:outline-none ${
              variant === 'dark'
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            tabIndex={-1}
          >
            {showPassword ? (
              <VisibilityOffIcon className="!h-4.5 !w-4.5" />
            ) : (
              <VisibilityIcon className="!h-4.5 !w-4.5" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-xs font-semibold text-rose-500 font-sans select-none animate-in fade-in slide-in-from-top-1 duration-150 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
