import React from 'react';
import DeleteDialog from '@/components/common/DeleteDialog';

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  loading?: boolean;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onClose,
  onConfirm,
  productName,
  loading = false,
}) => {
  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Product?"
      message={`Are you sure you want to delete "${productName}"? This will deactivate the product catalog item and hide it from the active list.`}
      confirmText="Delete"
      loading={loading}
    />
  );
};

export default DeleteProductDialog;
