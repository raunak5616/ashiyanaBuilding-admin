import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import Sidebar from '@/navigation/Sidebar';
import Topbar from '@/navigation/Topbar';
import { toggleSidebar } from '@/store/uiSlice';

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch();
  const sidebarCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 overflow-x-hidden">
      {/* Dark Overlay backdrop on mobile when sidebar is open */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-45 md:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => dispatch(toggleSidebar())}
        ></div>
      )}

      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Layout Wrapper */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out min-h-screen w-full
          ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}`}
      >
        {/* Sticky Top Header */}
        <Topbar />

        {/* Content Body Viewport */}
        <main className="flex-1 p-4 sm:p-6 mt-16 flex flex-col bg-inherit w-full overflow-y-auto">
          <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer Bar */}
        <footer className="py-4 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400 font-sans tracking-wide select-none">
          &copy; {new Date().getFullYear()} Aashiyana Building Materials. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
