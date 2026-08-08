import React, { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { User } from '@/features/auth/authSlice';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';

interface DashboardHeaderProps {
  user: User | null;
  range: string;
  startDate?: string;
  endDate?: string;
  onRangeChange: (range: string, start?: string, end?: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  range,
  startDate,
  endDate,
  onRangeChange,
}) => {
  const [customOpen, setCustomOpen] = useState(false);
  const [startInput, setStartInput] = useState(startDate || '');
  const [endInput, setEndInput] = useState(endDate || '');

  const handleSelectChange = (val: string) => {
    if (val === 'custom') {
      setCustomOpen(true);
    } else {
      onRangeChange(val);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startInput && endInput) {
      onRangeChange('custom', startInput, endInput);
      setCustomOpen(false);
    }
  };

  const getRangeLabel = () => {
    switch (range) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'thisYear': return 'This Year';
      case 'custom': return `${startDate} to ${endDate}`;
      default: return 'This Month';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm select-none">
      <div>
        <h1 className="text-xl font-black text-secondary font-heading leading-tight">
          Welcome back, {user?.fullName || 'Manager'}!
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Here is a summary of Aashiyana Building Materials performance for: <span className="font-semibold text-slate-600">{getRangeLabel()}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={range}
          onChange={(e) => handleSelectChange(e.target.value as string)}
          size="small"
          className="!font-sans !text-xs !bg-slate-50 !rounded-xl !border-slate-200 !w-full sm:!w-44"
          classes={{
            select: '!py-2 !px-3',
          }}
          startAdornment={<CalendarMonthIcon className="!h-4 !w-4 text-slate-400 mr-2 shrink-0" />}
        >
          <MenuItem value="today" className="!text-xs !font-sans">Today</MenuItem>
          <MenuItem value="yesterday" className="!text-xs !font-sans">Yesterday</MenuItem>
          <MenuItem value="thisWeek" className="!text-xs !font-sans">This Week</MenuItem>
          <MenuItem value="thisMonth" className="!text-xs !font-sans">This Month</MenuItem>
          <MenuItem value="thisYear" className="!text-xs !font-sans">This Year</MenuItem>
          <MenuItem value="custom" className="!text-xs !font-sans">Custom Range...</MenuItem>
        </Select>

        <Dialog
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          slotProps={{
            paper: {
              className: '!rounded-2xl !p-2 !max-w-[280px] !w-full border border-slate-100',
            },
          }}
        >
          <DialogTitle className="!font-heading !font-black !text-sm !text-secondary !pb-1">
            Select Date Range
          </DialogTitle>
          <form onSubmit={handleCustomSubmit}>
            <DialogContent className="!pb-4 !pt-2 space-y-4">
              <FormInput
                label="Start Date"
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                required
              />
              <FormInput
                label="End Date"
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                required
              />
            </DialogContent>
            <DialogActions className="!px-6 !pb-4 !gap-2">
              <SecondaryButton type="button" onClick={() => setCustomOpen(false)} className="!py-1.5 !px-3 !text-xs">
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" className="!py-1.5 !px-3 !text-xs">
                Apply
              </PrimaryButton>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
};

export default DashboardHeader;
