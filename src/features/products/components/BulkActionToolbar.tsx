import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkRestore: () => void;
  showRestoreButton?: boolean;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkRestore,
  showRestoreButton = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E293B] text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-6 animate-bounce-in border border-slate-700/50 select-none font-sans max-w-[90vw] sm:max-w-max">
      {/* Count Info */}
      <div className="flex items-center gap-3">
        <span className="h-6 w-6 rounded-full bg-primary text-white font-extrabold flex items-center justify-center text-xs shrink-0">
          {selectedCount}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap text-slate-300">
          {selectedCount === 1 ? 'Product selected' : 'Products selected'}
        </span>
      </div>

      <div className="h-5 w-[1px] bg-slate-700"></div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {showRestoreButton ? (
          <button
            onClick={onBulkRestore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <RestoreIcon className="h-4 w-4" />
            <span>Restore</span>
          </button>
        ) : (
          <>
            <button
              onClick={onBulkArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-amber-400 hover:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArchiveIcon className="h-4 w-4" />
              <span>Archive</span>
            </button>
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <DeleteIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      <div className="h-5 w-[1px] bg-slate-700"></div>

      {/* Clear/Deselect */}
      <IconButton
        onClick={onClearSelection}
        size="small"
        className="!text-slate-400 hover:!text-white hover:!bg-slate-800"
      >
        <CloseIcon className="h-4 w-4" />
      </IconButton>
    </div>
  );
};

export default BulkActionToolbar;
