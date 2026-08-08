import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

import { useResetStaffPasswordMutation, StaffUser } from '../usersApi';

interface ResetPasswordDialogProps {
  open: boolean;
  staff: StaffUser;
  onClose: () => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, staff, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [resetStaffPassword, { isLoading }] = useResetStaffPasswordMutation();

  // Password Policy Validators
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');

    try {
      await resetStaffPassword({
        id: staff.id,
        body: { newPassword },
      }).unwrap();
      onClose();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  const validationItem = (label: string, met: boolean) => (
    <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-500">
      {met ? (
        <CheckIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1 shrink-0" />
      )}
      <span className={met ? 'text-emerald-700 font-bold' : ''}>{label}</span>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-2 border border-slate-100 shadow-2xl max-w-[400px]',
        },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary !pb-1 select-none">
        Reset Password
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="!pb-4 !pt-2 space-y-4 select-none">
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Assign a new password for <span className="font-bold text-slate-700">{staff.fullName}</span>.
          </p>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-600 font-sans font-semibold">
              <ErrorOutlineIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <FormInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />

          {/* Real-time policy validators checklist */}
          <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Password Strength Rules:
            </span>
            {validationItem('At least 8 characters long', hasMinLength)}
            {validationItem('At least one uppercase letter (A-Z)', hasUppercase)}
            {validationItem('At least one lowercase letter (a-z)', hasLowercase)}
            {validationItem('At least one number (0-9)', hasDigit)}
            {validationItem('At least one special character (!@#$...)', hasSpecial)}
          </div>

          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />

          {newPassword && confirmPassword && (
            <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold px-1">
              {passwordsMatch ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Passwords match</span>
                </>
              ) : (
                <>
                  <ErrorOutlineIcon className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-rose-500">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions className="!px-6 !pb-4 !gap-2 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} disabled={!canSubmit} className="!py-2.5 !px-4">
            Reset Password
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPasswordDialog;
