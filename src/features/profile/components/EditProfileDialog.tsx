import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormInput from '@/components/common/FormInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useUpdateProfileMutation } from '../profileApi';

const editProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s()-]/g, '')),
      { message: 'Invalid phone number format. Provide 10-15 digits.' }
    ),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  initialPhone?: string;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  initialPhone = '',
  onSuccessToast,
  onErrorToast,
}) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      phone: initialPhone,
    },
  });

  const handleFormSubmit = async (data: EditProfileFormValues) => {
    try {
      await updateProfile({ phone: data.phone }).unwrap();
      onSuccessToast('Profile details updated successfully.');
      reset(data);
      onClose();
    } catch (err: any) {
      onErrorToast(err?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCancelClick}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            className: '!rounded-2xl border border-slate-100 !shadow-2xl p-2',
          },
        }}
      >
        <DialogTitle className="!font-heading !font-black !text-secondary !text-lg pb-1">
          Edit Profile
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent className="space-y-4 !py-3">
            <p className="text-xs text-slate-400 select-none mb-2 font-sans leading-relaxed">
              Updating your profile details. Note that other fields (like full name and role) are locked and managed by your shop administrator.
            </p>
            <FormInput
              {...register('phone')}
              label="Phone Number"
              placeholder="e.g. +919876543210"
              error={errors.phone?.message}
              disabled={isLoading}
              autoFocus
            />
          </DialogContent>
          <DialogActions className="!px-6 !pb-4 pt-2 gap-2">
            <Button
              onClick={handleCancelClick}
              color="inherit"
              disabled={isLoading}
              className="!text-xs !font-bold !font-sans !text-slate-500 !text-transform-none !rounded-xl !py-2.5 !px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !isDirty}
              startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : null}
              className="!text-xs !font-bold !font-sans !bg-secondary !text-primary !text-transform-none !rounded-xl !py-2.5 !px-5 hover:!bg-slate-800"
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Unsaved Changes Confirmation */}
      {showCancelConfirm && (
        <ConfirmDialog
          open={showCancelConfirm}
          title="Discard Unsaved Changes?"
          message="You have modified profile fields. Closing will permanently discard these changes. Are you sure you want to close?"
          confirmText="Discard"
          onConfirm={() => {
            setShowCancelConfirm(false);
            reset({ phone: initialPhone });
            onClose();
          }}
          onClose={() => setShowCancelConfirm(false)}
        />
      )}
    </>
  );
};

export default EditProfileDialog;
