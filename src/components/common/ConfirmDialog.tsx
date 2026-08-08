import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'Please confirm this action to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-2 !max-w-md !w-full border border-slate-100',
        },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-lg !text-secondary !pb-2">
        {title}
      </DialogTitle>
      <DialogContent className="!text-slate-500 !text-sm !font-sans !pb-4 leading-relaxed">
        {message}
      </DialogContent>
      <DialogActions className="!px-6 !pb-4 !gap-2">
        <SecondaryButton onClick={onClose} disabled={loading}>
          {cancelText}
        </SecondaryButton>
        <PrimaryButton onClick={onConfirm} loading={loading}>
          {confirmText}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
