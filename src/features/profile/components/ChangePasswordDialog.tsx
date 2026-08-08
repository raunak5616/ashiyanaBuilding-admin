import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChangePasswordForm from './ChangePasswordForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useChangeProfilePasswordMutation } from '../profileApi';
import { clearCredentials } from '@/features/auth/authSlice';

const passwordRulesSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const changePasswordValidationSchema = z
  .object({
    newPassword: passwordRulesSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordValidationSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  userId,
  onSuccessToast,
  onErrorToast,
}) => {
  const dispatch = useDispatch();
  const [changePassword, { isLoading }] = useChangeProfilePasswordMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordFormValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordValidationSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = (data: ChangePasswordFormValues) => {
    setFormData(data);
    setConfirmOpen(true);
  };

  const handleConfirmPasswordChange = async () => {
    if (!formData) return;
    setConfirmOpen(false);

    try {
      await changePassword({
        id: userId,
        body: { newPassword: formData.newPassword },
      }).unwrap();

      onSuccessToast('Password changed successfully. Logging out of sessions...');
      
      // Delay slightly so the user sees the success toast, then logout
      setTimeout(() => {
        dispatch(clearCredentials());
      }, 1500);

      reset();
      onClose();
    } catch (err: any) {
      onErrorToast(err?.data?.message || 'Failed to change password. Make sure all requirements are met.');
    } finally {
      setFormData(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            className: '!rounded-2xl border border-slate-100 !shadow-2xl p-2',
          },
        }}
      >
        <DialogTitle className="!font-heading !font-black !text-secondary !text-lg pb-1">
          Change Password
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent className="space-y-4 !py-3">
            {/* Security Warning Notice */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs select-none">
              <WarningAmberIcon className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="font-sans leading-relaxed">
                <strong>Important:</strong> Changing your password will invalidate your existing sessions. You will be logged out automatically and will need to log back in.
              </p>
            </div>

            <ChangePasswordForm
              register={register}
              errors={errors}
              watch={watch}
              disabled={isLoading}
            />
          </DialogContent>
          <DialogActions className="!px-6 !pb-4 pt-2 gap-2">
            <Button
              onClick={onClose}
              color="inherit"
              disabled={isLoading}
              className="!text-xs !font-bold !font-sans !text-slate-500 !text-transform-none !rounded-xl !py-2.5 !px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : null}
              className="!text-xs !font-bold !font-sans !bg-secondary !text-primary !text-transform-none !rounded-xl !py-2.5 !px-5 hover:!bg-slate-800"
            >
              Update Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          title="Confirm Password Change"
          message="Are you sure you want to change your password? You will be immediately logged out of all active devices."
          confirmText="Confirm Change"
          onConfirm={handleConfirmPasswordChange}
          onClose={() => {
            setConfirmOpen(false);
            setFormData(null);
          }}
          loading={isLoading}
        />
      )}
    </>
  );
};

export default ChangePasswordDialog;
