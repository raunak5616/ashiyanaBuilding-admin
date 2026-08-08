import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

// MUI Icons
import AddIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';

import StatusChip from '@/components/common/StatusChip';
import {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useArchiveExpenseCategoryMutation,
  useRestoreExpenseCategoryMutation,
  ExpenseCategory,
} from '../expenseApi';

interface ExpenseCategoryManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ExpenseCategoryManagerDialog: React.FC<ExpenseCategoryManagerDialogProps> = ({ open, onClose }) => {
  // Query categories (both active and inactive)
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetExpenseCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // Mutations
  const [createCategory, { isLoading: isCreating }] = useCreateExpenseCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateExpenseCategoryMutation();
  const [archiveCategory, { isLoading: isArchiving }] = useArchiveExpenseCategoryMutation();
  const [restoreCategory, { isLoading: isRestoring }] = useRestoreExpenseCategoryMutation();

  // Local Form States
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inline editing row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    try {
      await createCategory({ name: newName.trim(), description: newDesc.trim() || undefined }).unwrap();
      setNewName('');
      setNewDesc('');
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to create category.');
    }
  };

  const handleStartEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  const handleSaveEdit = async (catId: string) => {
    setErrorMsg('');
    if (!editName.trim()) {
      setErrorMsg('Category name cannot be empty.');
      return;
    }

    try {
      await updateCategory({
        id: catId,
        body: { name: editName.trim(), description: editDesc.trim() || undefined },
      }).unwrap();
      setEditingId(null);
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to save changes.');
    }
  };

  const handleToggleArchive = async (cat: ExpenseCategory) => {
    setErrorMsg('');
    try {
      if (cat.isActive) {
        await archiveCategory(cat.id).unwrap();
      } else {
        await restoreCategory(cat.id).unwrap();
      }
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to toggle archive status.');
    }
  };

  const isSaving = isCreating || isUpdating || isArchiving || isRestoring;

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-2 border border-slate-100 shadow-2xl',
        },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary !pb-2 select-none">
        Manage Expense Categories
      </DialogTitle>

      <DialogContent className="!pb-6 !pt-2 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
        {errorMsg && (
          <Alert severity="error" className="rounded-xl font-sans text-xs">
            {errorMsg}
          </Alert>
        )}

        {/* Create inline Form card */}
        <form onSubmit={handleAddCategory} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-end select-none">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
              Category Name *
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Utility Bills"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isSaving}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' } } }}
            />
          </div>

          <div className="flex-[2] w-full space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
              Short Description
            </label>
            <TextField
              size="small"
              fullWidth
              placeholder="Electricity, office rent, water charges, internet bills..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              disabled={isSaving}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' } } }}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            disabled={isSaving}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 capitalize font-sans text-xs font-semibold px-4 min-h-[40px] shrink-0"
          >
            Add Category
          </Button>
        </form>

        {/* Categories Table list */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans select-none">
            Registered Categories
          </label>

          {categoriesLoading ? (
            <div className="py-10 flex justify-center">
              <CircularProgress size={24} className="text-slate-900" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 select-none">
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-slate-400 uppercase font-sans w-1/3">Name</th>
                    <th className="py-2.5 px-4 text-left text-[11px] font-bold text-slate-400 uppercase font-sans">Description</th>
                    <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-400 uppercase font-sans w-24">Status</th>
                    <th className="py-2.5 px-4 text-right text-[11px] font-bold text-slate-400 uppercase font-sans w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.length === 0 ? (
                    <tr className="select-none">
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400 italic">
                        No expense categories registered.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => {
                      const isEditing = editingId === cat.id;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/20 text-xs font-sans text-slate-700">
                          {/* Name field */}
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            {isEditing ? (
                              <TextField
                                size="small"
                                fullWidth
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled={isSaving}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#cbd5e1' } } }}
                              />
                            ) : (
                              cat.name
                            )}
                          </td>

                          {/* Description field */}
                          <td className="py-2.5 px-4 text-slate-500 font-medium">
                            {isEditing ? (
                              <TextField
                                size="small"
                                fullWidth
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                disabled={isSaving}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#cbd5e1' } } }}
                              />
                            ) : (
                              cat.description || '—'
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-4 text-center select-none">
                            <StatusChip status={cat.isActive ? 'success' : 'error'} label={cat.isActive ? 'Active' : 'Archived'} />
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right select-none">
                            <div className="flex justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <Tooltip title="Save Changes">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleSaveEdit(cat.id)}
                                        disabled={isSaving}
                                        className="text-emerald-600 hover:bg-emerald-50"
                                      >
                                        <SaveIcon className="h-4 w-4" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title="Cancel Edit">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="text-slate-400 hover:bg-slate-50"
                                      >
                                        <CloseIcon className="h-4 w-4" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit Category">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleStartEdit(cat)}
                                        disabled={isSaving}
                                        className="text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                                      >
                                        <EditIcon className="h-4 w-4" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title={cat.isActive ? 'Archive Category' : 'Restore Category'}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleToggleArchive(cat)}
                                        disabled={isSaving}
                                        className={cat.isActive ? 'text-rose-400 hover:bg-rose-50' : 'text-emerald-400 hover:bg-emerald-50'}
                                      >
                                        {cat.isActive ? <BlockIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions className="!px-6 !pb-4 select-none">
        <Button type="button" onClick={onClose} disabled={isSaving} className="!py-2 !px-4" variant="outlined">Close Manager</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseCategoryManagerDialog;
