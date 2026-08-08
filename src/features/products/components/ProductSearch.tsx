import React from 'react';
import SearchToolbar from '@/components/common/SearchToolbar';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search products by name, SKU, or barcode...',
}) => {
  return (
    <SearchToolbar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default ProductSearch;
