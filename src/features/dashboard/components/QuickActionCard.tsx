import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppCard from '@/components/common/AppCard';

// Import MUI Icons
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCartOutlined';
import AddBoxIcon from '@mui/icons-material/AddBoxOutlined';
import WarehouseIcon from '@mui/icons-material/WarehouseOutlined';
import PaidIcon from '@mui/icons-material/PaidOutlined';

export const QuickActionCard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New POS Sale',
      desc: 'Checkout new customer orders',
      icon: <AddShoppingCartIcon className="!h-5 !w-5 text-primary" />,
      path: '/sales',
      color: 'hover:!border-primary/60 hover:!bg-primary/5',
    },
    {
      title: 'Register Product',
      desc: 'Add items to system catalog',
      icon: <AddBoxIcon className="!h-5 !w-5 text-secondary" />,
      path: '/products',
      color: 'hover:!border-slate-400 hover:!bg-slate-50',
    },
    {
      title: 'Stock Intake',
      desc: 'Log purchase orders or counts',
      icon: <WarehouseIcon className="!h-5 !w-5 text-sky-500" />,
      path: '/inventory',
      color: 'hover:!border-sky-200 hover:!bg-sky-50/20',
    },
    {
      title: 'Record Expense',
      desc: 'Log utility or operations costs',
      icon: <PaidIcon className="!h-5 !w-5 text-rose-500" />,
      path: '/expenses',
      color: 'hover:!border-rose-200 hover:!bg-rose-50/20',
    },
  ];

  return (
    <AppCard title="Quick Actions" subtitle="Instant access to common operations">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, idx) => (
          <div
            key={idx}
            onClick={() => navigate(act.path)}
            className={`flex items-start gap-4 p-4 rounded-xl border border-slate-200/60 cursor-pointer shadow-sm transition-all duration-200 ${act.color}`}
          >
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
              {act.icon}
            </div>
            <div className="space-y-0.5 select-none font-sans">
              <h4 className="text-xs font-black text-slate-800 leading-none">
                {act.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                {act.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
};

export default QuickActionCard;
