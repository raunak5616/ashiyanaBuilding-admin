import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@mui/material/Button';

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  status = 404,
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist or has been moved.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-12 px-6 text-center select-none bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-xl mx-auto my-8">
      <div className="text-9xl font-black text-slate-100 tracking-tighter font-heading select-none leading-none">
        {status}
      </div>
      <h2 className="text-2xl font-black text-secondary font-heading mt-6 mb-2">
        {title}
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-8 font-sans">
        {message}
      </p>
      <Button
        variant="contained"
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className="!bg-secondary !text-primary hover:!bg-slate-800 !font-bold !py-2.5 !px-6 !rounded-xl !shadow-none !normal-case font-sans"
      >
        Back to Dashboard
      </Button>
    </div>
  );
};

export default ErrorPage;
