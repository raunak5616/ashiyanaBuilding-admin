import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface SecondaryButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <Button
      variant="outlined"
      disabled={disabled || loading}
      className={`!border-slate-200 hover:!border-slate-300 hover:!bg-slate-50 !text-slate-700 !font-semibold !py-2.5 !px-5 !rounded-xl !shadow-none !normal-case transition-all duration-200 font-sans relative ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <CircularProgress size={16} color="inherit" className="!text-slate-400" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

export default SecondaryButton;
