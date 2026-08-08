import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

import {
  useChangeStaffRoleMutation,
  useGetRolesListQuery,
  StaffUser,
} from '../usersApi';

interface ChangeRoleDialogProps {
  open: boolean;
  staff: StaffUser;
  onClose: () => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({ open, staff, onClose }) => {
  const [roleId, setRoleId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: rolesResponse } = useGetRolesListQuery();
  const [changeStaffRole, { isLoading }] = useChangeStaffRoleMutation();

  const roles = rolesResponse?.data || [];

  useEffect(() => {
    if (staff?.role?.id) {
      setRoleId(staff.role.id);
    } else {
      setRoleId('');
    }
    setErrorMsg('');
  }, [staff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId || roleId === staff.role?.id) return;

    setErrorMsg('');

    try {
      await changeStaffRole({
        id: staff.id,
        body: { roleId },
      }).unwrap();
      onClose();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to update user role. Please try again.');
    }
  };

  const hasChanged = roleId !== staff.role?.id && roleId !== '';

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-2 border border-slate-100 shadow-2xl max-w-[360px]',
        },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary !pb-1 select-none">
        Reassign Role
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="!pb-4 !pt-2 space-y-4 select-none">
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Choose a new role assignment for <span className="font-bold text-slate-700">{staff.fullName}</span>.
          </p>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-600 font-sans font-semibold">
              <ErrorOutlineIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <FormControl fullWidth className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              disabled={isLoading}
              className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
              classes={{ select: '!py-2.5 !px-3.5' }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id || r._id} value={r.id || r._id} className="!text-sm !font-sans">
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions className="!px-6 !pb-4 !gap-2 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} disabled={!hasChanged} className="!py-2.5 !px-4">
            Reassign Role
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangeRoleDialog;
