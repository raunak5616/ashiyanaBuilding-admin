import React from 'react';

interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'red' | 'blue' | 'amber' | 'default';
}

interface Props {
  items: KpiItem[];
}

const colorMap = {
  green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  red: 'bg-rose-50 border-rose-100 text-rose-700',
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  amber: 'bg-amber-50 border-amber-100 text-amber-700',
  default: 'bg-slate-50 border-slate-100 text-slate-700',
};

export const ReportKpiBar: React.FC<Props> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 select-none">
      {items.map((item, idx) => {
        const colorClass = colorMap[item.color || 'default'];
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-4 flex flex-col gap-1 ${colorClass}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest font-sans opacity-70">
              {item.label}
            </p>
            <p className="text-lg font-black font-heading leading-tight">{item.value}</p>
            {item.sub && (
              <p className="text-[10px] font-medium font-sans opacity-60">{item.sub}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReportKpiBar;
