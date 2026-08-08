import React from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface ArchiveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  action: 'archive' | 'restore';
  loading?: boolean;
}

export const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  open,
  onClose,
  onConfirm,
  productName,
  action,
  loading = false,
}) => {
  const isArchive = action === 'archive';
  return (
    <ConfirmDialog
      open={open}
      title={isArchive ? 'Archive Product?' : 'Restore Product?'}
      message={
        isArchive
          ? `Are you sure you want to archive "${productName}"? Archived products cannot be sold in new invoices but will remain in historical records.`
          : `Are you sure you want to restore "${productName}"? This will make the product available for inventory transactions and sales immediately.`
      }
      confirmText={isArchive ? 'Archive' : 'Restore'}
      onConfirm={onConfirm}
      onClose={onClose}
      loading={loading}
    />
  );
};

export default ArchiveDialog;
