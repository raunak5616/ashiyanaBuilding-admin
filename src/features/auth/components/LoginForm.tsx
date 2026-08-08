import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { ROUTES } from '@/constants/routes';
import FormInput from '@/components/common/FormInput';
import PasswordInput from '@/components/common/PasswordInput';
import PrimaryButton from '@/components/common/PrimaryButton';

// Zod Validation Schema matching backend validation
const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  // Determine post-login redirect path
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setApiError(null);
    try {
      // Execute login mutation
      const response = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      // Set credentials in Redux Auth Slice
      dispatch(
        setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
        })
      );

      // Redirect to target destination
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login request failed:', error);
      const message = error?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* API Error Banner */}
      {apiError && (
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs font-semibold text-rose-400 font-sans select-none animate-in fade-in slide-in-from-top-2 duration-200">
          {apiError}
        </div>
      )}

      {/* Email Input */}
      <FormInput
        {...register('email')}
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        variant="dark"
        error={errors.email?.message}
        disabled={isLoading}
        autoComplete="email"
        autoFocus
      />

      {/* Password Input */}
      <PasswordInput
        {...register('password')}
        label="Password"
        placeholder="Enter your password"
        variant="dark"
        error={errors.password?.message}
        disabled={isLoading}
        autoComplete="current-password"
      />

      {/* Remember Me & Forgot Password triggers */}
      <div className="flex items-center justify-between text-xs font-sans select-none pt-1">
        <label className="flex items-center text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900"
            disabled={isLoading}
          />
          <span className="ml-2 font-medium">Remember me</span>
        </label>
        
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login Submit Button */}
      <PrimaryButton
        type="submit"
        loading={isLoading}
        className="w-full !mt-6 shadow-lg shadow-primary/10"
      >
        Sign In
      </PrimaryButton>
    </form>
  );
};

export default LoginForm;
