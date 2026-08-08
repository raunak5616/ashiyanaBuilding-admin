import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/HomeOutlined';

const ROUTE_NAMES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.INVENTORY]: 'Inventory',
  [ROUTES.PURCHASES]: 'Purchases',
  [ROUTES.SALES]: 'Sales POS',
  [ROUTES.CUSTOMERS]: 'Customers',
  [ROUTES.SUPPLIERS]: 'Suppliers',
  [ROUTES.EXPENSES]: 'Expenses',
  [ROUTES.REPORTS]: 'Reports',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.PROFILE]: 'My Profile',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-[11px] text-slate-400 font-sans select-none tracking-wide">
      <Link 
        to={ROUTES.DASHBOARD} 
        className="flex items-center gap-1 hover:text-slate-600 transition-colors"
      >
        <HomeIcon className="!h-3.5 !w-3.5" />
        <span>Home</span>
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const name = ROUTE_NAMES[to] || value.charAt(0).toUpperCase() + value.slice(1);
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRightIcon className="!h-3 !w-3 mx-1.5 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-secondary">{name}</span>
            ) : (
              <Link to={to} className="hover:text-slate-600 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
