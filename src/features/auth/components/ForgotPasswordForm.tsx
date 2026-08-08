import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import InfoIcon from '@mui/icons-material/InfoOutlined';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center mb-6">
            <h3 className="text-lg font-black text-white font-heading">
              Forgot Password
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Enter your email address to request a password reset.
            </p>
          </div>

          <FormInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            variant="dark"
            required
            autoComplete="email"
          />

          <PrimaryButton type="submit" className="w-full">
            Submit Request
          </PrimaryButton>

          <div className="text-center pt-2">
            <Link
              to={ROUTES.LOGIN}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors font-sans"
            >
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center py-4 select-none">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
            <InfoIcon className="!h-6 !w-6" />
          </div>
          
          <h3 className="text-lg font-black text-white font-heading">
            Contact Administrator
          </h3>
          
          <div className="text-xs text-slate-300 font-sans space-y-3 leading-relaxed max-w-sm mx-auto">
            <p>
              Self-service password reset is disabled for staff accounts.
            </p>
            <p className="text-slate-400">
              Please contact your <strong className="text-slate-200">Shop Owner</strong> or <strong className="text-slate-200">System Administrator</strong> to reset your login credentials.
            </p>
          </div>

          <Link to={ROUTES.LOGIN} className="block mt-6">
            <SecondaryButton className="w-full !border-slate-800 hover:!bg-slate-800/40 !text-slate-300">
              Back to Login
            </SecondaryButton>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
