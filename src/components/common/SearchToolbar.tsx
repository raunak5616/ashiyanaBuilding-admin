import React from 'react';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import PrimaryButton from './PrimaryButton';

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm w-full select-none">
      {/* Search Input Box */}
      <div className="relative w-full sm:max-w-xs">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-sans"
        />
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 !h-4.5 !w-4.5 text-slate-400" />
      </div>

      {/* Optional action buttons */}
      {actionText && onAction && (
        <PrimaryButton 
          onClick={onAction}
          startIcon={actionIcon}
          className="!py-2 !px-4 !text-xs w-full sm:w-auto font-sans"
        >
          {actionText}
        </PrimaryButton>
      )}
    </div>
  );
};

export default SearchToolbar;
