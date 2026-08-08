import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import SecondaryButton from '@/components/common/SecondaryButton';
import LockOpenIcon from '@mui/icons-material/LockOpenOutlined';

export const ResetPasswordForm: React.FC = () => {
  return (
    <div className="space-y-6 text-center py-4 select-none">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 mb-4">
        <LockOpenIcon className="!h-6 !w-6" />
      </div>
      
      <h3 className="text-lg font-black text-white font-heading">
        Reset Password
      </h3>
      
      <div className="text-xs text-slate-300 font-sans space-y-3 leading-relaxed max-w-sm mx-auto">
        <p>
          Password resets must be initiated from inside the administrative panel.
        </p>
        <p className="text-slate-400">
          If you are logged in, you can update your password under your profile settings. Otherwise, please contact your Shop Owner.
        </p>
      </div>

      <Link to={ROUTES.LOGIN} className="block mt-6">
        <SecondaryButton className="w-full !border-slate-800 hover:!bg-slate-800/40 !text-slate-300 font-sans">
          Back to Login
        </SecondaryButton>
      </Link>
    </div>
  );
};

export default ResetPasswordForm;
