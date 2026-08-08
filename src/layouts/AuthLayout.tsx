import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

import logoImage from '@/assets/Aashiyana.jpg';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl shadow-primary/10 rotate-3 hover:rotate-12 transition-transform duration-300 border border-slate-800">
          <img src={logoImage} alt="Aashiyana Logo" className="h-full w-full object-cover" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-primary font-heading">
          Aashiyana
        </h2>
        <p className="mt-1 text-center text-xs tracking-widest text-slate-400 uppercase font-sans">
          Building Materials ERP
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
