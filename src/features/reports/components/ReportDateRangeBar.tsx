import React from 'react';
import Button from '@mui/material/Button';
import type { RangePreset } from '../reportApi';

interface Props {
  range: RangePreset;
  startDate?: string;
  endDate?: string;
  onChange: (range: RangePreset, startDate?: string, endDate?: string) => void;
}

const PRESETS: { label: string; value: RangePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'This Year', value: 'thisYear' },
];

export const ReportDateRangeBar: React.FC<Props> = ({ range, startDate, endDate, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center select-none">
      {/* Preset buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg font-sans transition-all duration-150 ${
              range === p.value && range !== 'custom'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span className="text-slate-200 hidden sm:block">|</span>

      {/* Custom date range */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Custom:</span>
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onChange('custom', e.target.value, endDate)}
          className="text-xs font-sans border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
        />
        <span className="text-xs text-slate-400 font-sans">to</span>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onChange('custom', startDate, e.target.value)}
          className="text-xs font-sans border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
        />
        {range === 'custom' && (startDate || endDate) && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onChange('thisMonth')}
            className="!text-[10px] !font-sans !rounded-lg !border-slate-200 !text-slate-400 !capitalize"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportDateRangeBar;
