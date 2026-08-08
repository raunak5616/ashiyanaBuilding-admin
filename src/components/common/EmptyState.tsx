import React from 'react';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import Button from '@mui/material/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  message = 'There are no records matching your request at this time.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center select-none bg-white rounded-2xl border border-dashed border-slate-200/80 p-8 max-w-md mx-auto my-4 w-full">
      <div className="text-slate-300 mb-4 select-none">
        {icon || <InboxIcon className="!h-10 !w-10" />}
      </div>
      <h3 className="text-base font-bold text-secondary font-sans mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs mb-6">
        {message}
      </p>
      {actionText && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          className="!bg-primary !text-secondary hover:!bg-primary-dark !font-bold !py-2 !px-5 !rounded-xl !shadow-none !normal-case text-xs font-sans"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
