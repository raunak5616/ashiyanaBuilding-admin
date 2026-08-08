import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import SaveBar from '../components/SaveBar';
import { useResetStaffPasswordMutation } from '@/features/users/usersApi';
import { updateClientSettings } from '../settingsSlice';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const changePasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const securitySchema = z.object({
  sessionTimeout: z.number().int().min(5, 'Minimum timeout is 5 minutes').max(1440, 'Maximum timeout is 24 hours'),
  twoFactorAuthentication: z.boolean(),
});

type ChangePasswordFormType = z.infer<typeof changePasswordSchema>;
type SecurityFormType = z.infer<typeof securitySchema>;

interface SecuritySettingsProps {
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSuccessToast, onErrorToast }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [resetPassword, { isLoading: isResetting }] = useResetStaffPasswordMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<ChangePasswordFormType | null>(null);

  // Password Form
  const { register: registerPass, handleSubmit: handleSubmitPass, reset: resetPass, formState: { errors: errorsPass } } = useForm<ChangePasswordFormType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Client Security settings Form
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SecurityFormType>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      sessionTimeout: clientSettings.sessionTimeout ?? 30,
      twoFactorAuthentication: clientSettings.twoFactorAuthentication ?? false,
    },
  });

  const resetForm = () => {
    reset({
      sessionTimeout: clientSettings.sessionTimeout ?? 30,
      twoFactorAuthentication: clientSettings.twoFactorAuthentication ?? false,
    });
  };

  const onSaveSecurity = (data: SecurityFormType) => {
    dispatch(updateClientSettings(data));
    onSuccessToast('Security settings updated successfully.');
    reset(data);
  };

  const handlePasswordSubmit = (data: ChangePasswordFormType) => {
    setTempPasswordData(data);
    setConfirmOpen(true);
  };

  const handleConfirmPasswordReset = async () => {
    if (!tempPasswordData || !currentUser?.id) return;
    setConfirmOpen(false);

    try {
      await resetPassword({
        id: currentUser.id,
        body: { newPassword: tempPasswordData.newPassword },
      }).unwrap();
      onSuccessToast('Your account password has been changed successfully.');
      resetPass();
    } catch (err: any) {
      onErrorToast(err.data?.message || 'Failed to change password. Make sure requirements are met.');
    } finally {
      setTempPasswordData(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Configurations Form */}
      <form onSubmit={handleSubmit(onSaveSecurity)}>
        <SettingSection title="Security Settings" subtitle="Configure session timeouts and login safety controls">
          
          <SettingCard title="Session Controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <TextField
                  {...register('sessionTimeout', { valueAsNumber: true })}
                  type="number"
                  label="Session Idle Timeout (Minutes)"
                  fullWidth
                  error={!!errors.sessionTimeout}
                  helperText={errors.sessionTimeout?.message}
                />
              </div>
              <div className="flex items-center">
                <Controller
                  name="twoFactorAuthentication"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Enable Two-Factor Authentication (Placeholder)"
                    />
                  )}
                />
              </div>
            </div>
          </SettingCard>
        </SettingSection>

        <SaveBar
          isVisible={isDirty}
          isLoading={false}
          onSave={handleSubmit(onSaveSecurity)}
          onReset={resetForm}
        />
      </form>

      {/* Password Reset Form */}
      <form onSubmit={handleSubmitPass(handlePasswordSubmit)}>
        <SettingSection title="Access Control" subtitle="Change login credentials for your administrator account">
          <SettingCard title="Change Password">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextField
                  {...registerPass('newPassword')}
                  type="password"
                  label="New Password"
                  fullWidth
                  error={!!errorsPass.newPassword}
                  helperText={errorsPass.newPassword?.message}
                  disabled={isResetting}
                />
              </div>
              <div>
                <TextField
                  {...registerPass('confirmPassword')}
                  type="password"
                  label="Confirm New Password"
                  fullWidth
                  error={!!errorsPass.confirmPassword}
                  helperText={errorsPass.confirmPassword?.message}
                  disabled={isResetting}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isResetting}
                  startIcon={isResetting ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    '&:hover': { bgcolor: 'text.secondary' },
                  }}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </SettingCard>
        </SettingSection>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Password Update</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.85rem' }}>
            Are you sure you want to change your account password? You will need to log in again using your new password next time.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmPasswordReset} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Confirm Change
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
