import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import {
  useCreateCategoryMutation,
  useCreateBrandMutation,
  useCreateUnitMutation,
  useGetCategoriesQuery,
} from '../productApi';

// ---- CATEGORY DIALOG ----
interface QuickAddCategoryProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (categoryId: string) => void;
}

export const QuickAddCategoryDialog: React.FC<QuickAddCategoryProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const { data: categoriesResponse } = useGetCategoriesQuery({ isActive: true });
  const categories = categoriesResponse?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await createCategory({
        name: name.trim(),
        parentCategoryId: parentCategoryId || undefined,
      }).unwrap();
      onSuccess(response.data.id);
      setName('');
      setParentCategoryId('');
      onClose();
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: '!rounded-2xl border border-slate-100 shadow-2xl p-2' },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary select-none">
        Add New Category
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 !py-2">
          <FormInput
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electrical Pipes"
            required
            disabled={isLoading}
          />
          <FormControl fullWidth className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
              Parent Category (Optional)
            </label>
            <Select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              displayEmpty
              disabled={isLoading}
              className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
              classes={{ select: '!py-2.5 !px-3.5' }}
            >
              <MenuItem value="" className="!text-sm !font-sans text-slate-400">
                None (Root Category)
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id} className="!text-sm !font-sans">
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 !pt-2 !gap-3 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} className="!py-2.5 !px-4">
            Create Category
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ---- BRAND DIALOG ----
interface QuickAddBrandProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (brandId: string) => void;
}

export const QuickAddBrandDialog: React.FC<QuickAddBrandProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [createBrand, { isLoading }] = useCreateBrandMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await createBrand({ name: name.trim() }).unwrap();
      onSuccess(response.data.id);
      setName('');
      onClose();
    } catch (err) {
      console.error('Failed to create brand:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: '!rounded-2xl border border-slate-100 shadow-2xl p-2' },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary select-none">
        Add New Brand
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 !py-2">
          <FormInput
            label="Brand Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Astral Pipes"
            required
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 !pt-2 !gap-3 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} className="!py-2.5 !px-4">
            Create Brand
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ---- UNIT DIALOG ----
interface QuickAddUnitProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (unitId: string) => void;
}

export const QuickAddUnitDialog: React.FC<QuickAddUnitProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [createUnit, { isLoading }] = useCreateUnitMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !abbreviation.trim()) return;

    try {
      const response = await createUnit({
        name: name.trim(),
        abbreviation: abbreviation.trim(),
      }).unwrap();
      onSuccess(response.data.id);
      setName('');
      setAbbreviation('');
      onClose();
    } catch (err) {
      console.error('Failed to create unit:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: '!rounded-2xl border border-slate-100 shadow-2xl p-2' },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary select-none">
        Add New Unit of Measure
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 !py-2">
          <FormInput
            label="Unit Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kilogram"
            required
            disabled={isLoading}
          />
          <FormInput
            label="Abbreviation"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            placeholder="e.g. kg"
            required
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 !pt-2 !gap-3 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} className="!py-2.5 !px-4">
            Create Unit
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
