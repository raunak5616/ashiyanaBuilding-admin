import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <Button
      variant="contained"
      disabled={disabled || loading}
      className={`!bg-primary hover:!bg-primary-dark !text-secondary !font-bold !py-2.5 !px-5 !rounded-xl !shadow-none !normal-case transition-all duration-200 font-sans relative ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <CircularProgress size={16} color="inherit" className="!text-secondary" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

export default PrimaryButton;
