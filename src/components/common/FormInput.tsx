import React, { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, variant = 'light', className = '', ...props }, ref) => {
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
            className={`w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 transition-all duration-200 ${inputClasses} ${
              error ? '!border-rose-500 focus:!ring-rose-500' : ''
            }`}
            {...props}
          />
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

FormInput.displayName = 'FormInput';
export default FormInput;
