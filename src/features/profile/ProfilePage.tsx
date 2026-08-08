import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/EditOutlined';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import AppCard from '@/components/common/AppCard';
import ErrorPage from '@/components/common/ErrorPage';

// Import subcomponents
import ProfileSkeleton from './components/ProfileSkeleton';
import ProfilePhotoUploader from './components/ProfilePhotoUploader';
import ProfileInformation from './components/ProfileInformation';
import AccountInformation from './components/AccountInformation';
import SecurityInformation from './components/SecurityInformation';
import PreferencesCard from './components/PreferencesCard';
import EditProfileDialog from './components/EditProfileDialog';
import ChangePasswordDialog from './components/ChangePasswordDialog';

// Import hooks and APIs
import { useGetProfileQuery } from './profileApi';
import { usePermissions } from '@/hooks/usePermissions';
import { clearCredentials } from '@/features/auth/authSlice';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { data: profileResponse, isLoading, isError, error } = useGetProfileQuery();
  const { hasPermission } = usePermissions();

  // Tab State
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'settings'>('personal');

  // Dialog States
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Snackbar States
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Permission Checks
  const user = profileResponse?.data;
  const canUploadPhoto = hasPermission('products:create') || hasPermission('products:update');
  const canChangePassword = hasPermission('users:reset_password');

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <ErrorPage
        title="Failed to load user profile"
        message={
          (error as any)?.data?.message ||
          'There was a problem communicating with the server. Please verify your connection.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <div>
          <h1 className="text-xl font-black text-secondary font-heading leading-tight">
            User Profile Settings
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Manage your personal profile details, account preferences, and login security controls.
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon className="h-4 w-4" />}
          className="!text-xs !font-bold !font-sans !text-transform-none !rounded-xl !py-2.5 !px-4 w-full sm:w-auto"
        >
          Sign Out
        </Button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column - Summary Card & Action Controls */}
        <div className="md:col-span-4 space-y-6">
          <AppCard className="flex flex-col items-center text-center p-6 space-y-5">
            {/* Photo Uploader */}
            <ProfilePhotoUploader
              fullName={user.fullName}
              currentPhotoUrl={user.profilePhoto?.url}
              onSuccessToast={(msg) => showToast(msg, 'success')}
              onErrorToast={(msg) => showToast(msg, 'error')}
              disabled={!canUploadPhoto}
            />

            {/* Basic Details */}
            <div className="space-y-1.5 select-none w-full">
              <h2 className="text-base font-black text-secondary font-heading truncate">
                {user.fullName}
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate lowercase">
                {user.email}
              </p>
              <div className="flex justify-center items-center gap-2 pt-2.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest bg-slate-100 border border-slate-200/50 py-1 px-2.5 rounded-lg">
                  {user.role?.name || (user.isOwner ? 'Owner' : 'Staff')}
                </span>
              </div>
            </div>

            {/* Main Actions Panel */}
            <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Button
                onClick={() => setEditOpen(true)}
                variant="contained"
                fullWidth
                startIcon={<EditIcon className="h-4 w-4" />}
                className="!text-xs !font-bold !font-sans !bg-secondary !text-primary !text-transform-none !rounded-xl !py-2.5 hover:!bg-slate-800"
              >
                Edit Profile Details
              </Button>

              <Button
                onClick={() => setPasswordOpen(true)}
                variant="outlined"
                fullWidth
                disabled={!canChangePassword}
                startIcon={<LockResetIcon className="h-4 w-4" />}
                className="!text-xs !font-bold !font-sans !text-secondary !border-slate-300 !text-transform-none !rounded-xl !py-2.5 hover:!bg-slate-50 disabled:!bg-slate-50 disabled:!text-slate-400"
              >
                Change Password
              </Button>

              {!canChangePassword && (
                <p className="text-[9px] text-slate-400 font-semibold select-none text-center italic">
                  Password edits require admin permissions.
                </p>
              )}
            </div>
          </AppCard>
        </div>

        {/* Right Column - Navigation Tabs & Data Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* Custom Tabbed Switch Panel */}
          <AppCard className="!py-3 !px-4 flex overflow-x-auto flex-nowrap gap-2.5 select-none scrollbar-none">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-1.5 px-3.5 text-xs font-bold font-sans rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/60 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`py-1.5 px-3.5 text-xs font-bold font-sans rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'account'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/60 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Account Details
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 px-3.5 text-xs font-bold font-sans rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/60 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              Preferences & Security
            </button>
          </AppCard>

          {/* Dynamic Views Rendering */}
          <div className="transition-all duration-300">
            {activeTab === 'personal' && (
              <ProfileInformation
                user={user}
                onEditClick={
                  <Button
                    size="small"
                    onClick={() => setEditOpen(true)}
                    startIcon={<EditIcon className="h-3.5 w-3.5" />}
                    className="!text-[11px] !font-bold !font-sans !text-secondary !text-transform-none hover:bg-slate-100 !py-1 !px-2.5 !rounded-lg"
                  >
                    Edit
                  </Button>
                }
              />
            )}

            {activeTab === 'account' && <AccountInformation user={user} />}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <PreferencesCard />
                <SecurityInformation />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Overlays */}
      {editOpen && (
        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialPhone={user.phone}
          onSuccessToast={(msg) => showToast(msg, 'success')}
          onErrorToast={(msg) => showToast(msg, 'error')}
        />
      )}

      {passwordOpen && (
        <ChangePasswordDialog
          open={passwordOpen}
          onClose={() => setPasswordOpen(false)}
          userId={user.id}
          onSuccessToast={(msg) => showToast(msg, 'success')}
          onErrorToast={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Toasts Messaging */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          className="!rounded-xl shadow-lg !text-xs !font-bold font-sans"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfilePage;
