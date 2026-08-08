import React, { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Close';
import LinearProgress from '@mui/material/LinearProgress';
import PasswordInput from '@/components/common/PasswordInput';

interface ChangePasswordFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
}

interface RuleItem {
  id: string;
  label: string;
  test: (val: string) => boolean;
}

const PASSWORD_RULES: RuleItem[] = [
  { id: 'length', label: 'At least 8 characters', test: (val) => val.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter', test: (val) => /[A-Z]/.test(val) },
  { id: 'lowercase', label: 'At least one lowercase letter', test: (val) => /[a-z]/.test(val) },
  { id: 'number', label: 'At least one numeric digit', test: (val) => /[0-9]/.test(val) },
  { id: 'special', label: 'At least one special character', test: (val) => /[^A-Za-z0-9]/.test(val) },
];

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  register,
  errors,
  watch,
  disabled = false,
}) => {
  const newPasswordVal = watch('newPassword') || '';
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    let score = 0;
    if (newPasswordVal.length > 0) {
      PASSWORD_RULES.forEach((rule) => {
        if (rule.test(newPasswordVal)) score += 1;
      });
    }
    setStrengthScore(score);
  }, [newPasswordVal]);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'error'; // weak
    if (score <= 3) return 'warning'; // fair/good
    return 'success'; // strong
  };

  const getStrengthText = (score: number) => {
    if (newPasswordVal.length === 0) return 'No Password';
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-4">
      {/* New Password Input */}
      <PasswordInput
        {...register('newPassword')}
        label="New Password"
        placeholder="Enter a new strong password"
        error={errors.newPassword?.message as string}
        disabled={disabled}
      />

      {/* Strength Bar */}
      {newPasswordVal.length > 0 && (
        <div className="space-y-1.5 select-none">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Strength</span>
            <span className={`font-black ${
              strengthScore <= 1 ? 'text-rose-500' : strengthScore <= 3 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {getStrengthText(strengthScore)}
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={(strengthScore / 5) * 100}
            color={getStrengthColor(strengthScore)}
            sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9' }}
          />
        </div>
      )}

      {/* Rules Checklist */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 select-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          Password Requirements
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {PASSWORD_RULES.map((rule) => {
            const isValid = rule.test(newPasswordVal);
            return (
              <div key={rule.id} className="flex items-center gap-1.5 text-xs">
                {newPasswordVal.length > 0 ? (
                  isValid ? (
                    <CheckIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ErrorIcon className="h-4 w-4 text-rose-500 shrink-0" />
                  )
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0 mx-1.5" />
                )}
                <span className={newPasswordVal.length > 0 ? (isValid ? 'text-slate-500 line-through' : 'text-slate-600 font-medium') : 'text-slate-400'}>
                  {rule.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Password Input */}
      <PasswordInput
        {...register('confirmPassword')}
        label="Confirm Password"
        placeholder="Re-enter your new password"
        error={errors.confirmPassword?.message as string}
        disabled={disabled}
      />
    </div>
  );
};

export default ChangePasswordForm;
