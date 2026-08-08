import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SecondaryButton from './SecondaryButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Record?',
  message = 'Are you sure you want to permanently delete this record? This action cannot be undone.',
  confirmText = 'Delete',
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
      <DialogTitle className="!font-heading !font-black !text-lg !text-rose-600 !pb-2">
        {title}
      </DialogTitle>
      <DialogContent className="!text-slate-500 !text-sm !font-sans !pb-4 leading-relaxed">
        {message}
      </DialogContent>
      <DialogActions className="!px-6 !pb-4 !gap-2">
        <SecondaryButton onClick={onClose} disabled={loading}>
          {cancelText}
        </SecondaryButton>
        <Button
          variant="contained"
          disabled={loading}
          onClick={onConfirm}
          className="!bg-rose-600 hover:!bg-rose-700 !text-white !font-bold !py-2.5 !px-5 !rounded-xl !shadow-none !normal-case font-sans"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <CircularProgress size={16} color="inherit" className="!text-white" />
              <span>Deleting...</span>
            </span>
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
