import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '@/app/rootReducer';
import { toggleSidebar } from '@/store/uiSlice';
import { toggleThemeMode } from '@/features/settings/settingsSlice';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import Breadcrumb from './Breadcrumb';

// Import MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';

export const Topbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);
  const sidebarCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Poll for pending orders every 10 seconds to keep live notifications
  const { data: pendingOrdersResponse } = useGetOrdersQuery({ status: 'pending' }, { pollingInterval: 10000 });
  const pendingOrders = pendingOrdersResponse?.data || [];
  const unreadCount = pendingOrders.length;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <header className={`fixed top-0 right-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? 'left-0 md:left-[72px]' : 'left-0 md:left-[240px]'}`}
    >
      {/* Left Actions: Collapse Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
            sidebarCollapsed ? 'block' : 'block md:hidden'
          }`}
          title="Toggle Sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Right Actions: Theme Toggle, Notifications, User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Theme mode toggle */}
        <button
          onClick={() => dispatch(toggleThemeMode())}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {themeMode === 'light' ? (
            <DarkModeIcon className="h-5 w-5" />
          ) : (
            <LightModeIcon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 relative transition-colors"
            title="Notifications"
          >
            <NotificationsIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Overlay */}
          {notificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setNotificationsOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2.5 w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 shadow-2xl ring-1 ring-black/5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-700 select-none mb-1">
                  <span className="text-xs font-black text-secondary dark:text-white font-heading">
                    Pending Orders
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-500 font-sans">
                      {unreadCount} action required
                    </span>
                  )}
                </div>

                {/* List */}
                <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-100/50 dark:divide-slate-700/50 scrollbar-none">
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((item) => (
                      <Link
                        key={item.id}
                        to={ROUTES.ORDERS}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer select-none my-0.5"
                      >
                        {/* Warning Icon Badge */}
                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                          <WarningIcon className="!h-4.5 !w-4.5" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold truncate leading-tight text-slate-900 dark:text-slate-100">
                              Order #{item.orderNumber}
                            </p>
                            <span className="text-[9px] text-slate-400 font-sans shrink-0">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 leading-relaxed break-words">
                            Placed by {item.customerUserId?.fullName || 'Customer'} - Total: ₹{Math.round(item.grandTotal / 100)}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center select-none">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-sans">No pending live orders</p>
                      <p className="text-[10px] text-slate-300 dark:text-slate-600 font-sans mt-0.5">Pending checkout requests will appear here</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-center pt-1.5 border-t border-slate-100 dark:border-slate-700 select-none mt-1">
                  <Link
                    to={ROUTES.ORDERS}
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User profile details & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 transition-colors select-none"
          >
            <div className="h-8 w-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center border border-slate-200">
              <AccountCircleIcon className="h-5 w-5" />
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-xs font-bold text-slate-700 leading-tight">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                {user?.role?.name || (user?.isOwner ? 'Owner' : 'Staff')}
              </span>
            </div>
            <KeyboardArrowDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile dropdown menu overlay */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <AccountCircleIcon className="h-4.5 w-4.5 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <SettingsIcon className="h-4.5 w-4.5 text-slate-400" />
                  Settings
                </Link>
                
                <div className="my-1.5 border-t border-slate-100"></div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <LogoutIcon className="h-4.5 w-4.5 text-rose-400" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
