import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/rootReducer';
import { toggleSidebar } from '@/store/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants/routes';

// Import MUI Icons
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import WarehouseIcon from '@mui/icons-material/WarehouseOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import logoImage from '@/assets/Aashiyana.jpg';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const sidebarCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);

  // Gated Navigation List Configuration
  const navItems: NavigationItem[] = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardIcon, permission: 'dashboard:read' },
    { name: 'Products', path: ROUTES.PRODUCTS, icon: StorefrontIcon, permission: 'products:read' },
    { name: 'Inventory', path: ROUTES.INVENTORY, icon: WarehouseIcon, permission: 'inventory:read' },
    { name: 'Live Orders', path: ROUTES.ORDERS, icon: ShoppingBagIcon, permission: 'sales:read' },
    { name: 'Purchases', path: ROUTES.PURCHASES, icon: LocalShippingIcon, permission: 'purchases:read' },
    { name: 'Sales POS', path: ROUTES.SALES, icon: ReceiptIcon, permission: 'sales:create' },
    { name: 'Customers', path: ROUTES.CUSTOMERS, icon: PeopleIcon, permission: 'customers:read' },
    { name: 'Suppliers', path: ROUTES.SUPPLIERS, icon: BusinessIcon, permission: 'suppliers:read' },
    { name: 'Expenses', path: ROUTES.EXPENSES, icon: WalletIcon, permission: 'expenses:read' },
    { name: 'Reports', path: ROUTES.REPORTS, icon: AssessmentIcon, permission: 'reports:view' },
    { name: 'Staff', path: ROUTES.STAFF, icon: BadgeIcon, permission: 'users:read' },
    { name: 'Settings', path: ROUTES.SETTINGS, icon: SettingsIcon, permission: 'settings:read' },
  ];

  // Filter items that current user has permission to view
  const visibleItems = navItems.filter((item) =>
    item.permission ? hasPermission(item.permission) : true
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-secondary text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-xl
        ${sidebarCollapsed ? 'w-[72px] -translate-x-full md:translate-x-0' : 'w-[240px] translate-x-0'}`}
    >
      {/* Sidebar Header Section */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-slate-800">
            <img src={logoImage} alt="Aashiyana Logo" className="h-full w-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-heading font-black text-lg tracking-wider text-white select-none whitespace-nowrap">
              AASHIYANA
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Arrow Button */}
        {!sidebarCollapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 select-none group ${
                  isActive
                    ? 'bg-primary text-secondary font-bold shadow-md shadow-primary/10'
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Account / Footer Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40">
        <div className="flex flex-col gap-1.5">
          {/* User Profile Info */}
          <NavLink
            to={ROUTES.PROFILE}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-xl text-sm transition-all duration-200 select-none ${
                isActive ? 'bg-slate-800/80 text-white' : 'hover:bg-slate-800/40'
              }`
            }
            title={sidebarCollapsed ? 'My Profile' : undefined}
          >
            <div className="h-9 w-9 bg-slate-800 text-slate-300 rounded-full flex items-center justify-center shrink-0 border border-slate-700">
              <AccountCircleIcon className="h-6 w-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-white truncate leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate mt-0.5">
                  {user?.role?.name || (user?.isOwner ? 'Owner' : 'Staff')}
                </p>
              </div>
            )}
          </NavLink>

          {/* Expand Trigger (if collapsed) */}
          {sidebarCollapsed && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="flex items-center justify-center p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          )}

          {/* Logout Trigger */}
          <button
            onClick={logout}
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 select-none"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
