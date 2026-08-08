import React from 'react';
import StatusChip from '@/components/common/StatusChip';

interface ProductStatusChipProps {
  isActive: boolean;
  className?: string;
}

export const ProductStatusChip: React.FC<ProductStatusChipProps> = ({
  isActive,
  className = '',
}) => {
  return (
    <StatusChip
      status={isActive ? 'success' : 'error'}
      label={isActive ? 'Active' : 'Archived'}
      className={className}
    />
  );
};

export default ProductStatusChip;
