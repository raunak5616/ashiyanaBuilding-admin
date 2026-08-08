import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useGetExpenseCategoriesQuery,
  Expense,
} from '../expenseApi';

const expenseSchema = z.object({
  expenseNumber: z
    .string()
    .trim()
    .min(1, 'Expense number is required')
    .max(32, 'Expense number must be 32 characters or less')
    .transform((val) => val.toUpperCase()),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Please select a category'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  expenseDate: z.string().optional().or(z.literal('')),
  paymentMethod: z.string().trim().optional().or(z.literal('')),
  status: z.enum(['pending', 'paid']),
  notes: z.string().trim().optional(),
});

interface ExpenseFormValues {
  expenseNumber: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate?: string;
  paymentMethod?: string;
  status: 'pending' | 'paid';
  notes?: string;
}

interface ExpenseFormDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({ open, expense, onClose }) => {
  const isEdit = Boolean(expense);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch active categories to populate dropdown select
  const { data: categoriesResponse } = useGetExpenseCategoriesQuery({ isActive: true });
  const categories = categoriesResponse?.data || [];

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseNumber: '',
      categoryId: '',
      title: '',
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().substring(0, 10),
      paymentMethod: 'Cash',
      status: 'paid',
      notes: '',
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        expenseNumber: expense.expenseNumber || '',
        categoryId: expense.categoryId || '',
        title: expense.title || '',
        description: expense.description || '',
        amount: expense.amount ? expense.amount / 100 : 0,
        expenseDate: expense.expenseDate ? expense.expenseDate.substring(0, 10) : '',
        paymentMethod: expense.paymentMethod || 'Cash',
        status: expense.status || 'paid',
        notes: expense.notes || '',
      });
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      reset({
        expenseNumber: `EXP-${new Date().getFullYear()}-${randomSuffix}`,
        categoryId: '',
        title: '',
        description: '',
        amount: 0,
        expenseDate: new Date().toISOString().substring(0, 10),
        paymentMethod: 'Cash',
        status: 'paid',
        notes: '',
      });
    }
    setErrorMsg('');
  }, [expense, reset, open]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setErrorMsg('');
    // Convert Rupee decimal to integer paise
    const payload = {
      ...values,
      amount: Math.round(values.amount * 100),
      expenseDate: values.expenseDate || undefined,
      paymentMethod: values.paymentMethod || undefined,
    };

    try {
      if (isEdit && expense) {
        await updateExpense({ id: expense.id, body: payload }).unwrap();
      } else {
        await createExpense(payload).unwrap();
      }
      onClose();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to save expense details.');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          className: '!rounded-2xl !p-2 border border-slate-100 shadow-2xl',
        },
      }}
    >
      <DialogTitle className="!font-heading !font-black !text-base !text-secondary !pb-2 select-none">
        {isEdit ? 'Edit Expense Record' : 'Record Shop Expense'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="!pb-6 !pt-2 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {errorMsg && (
            <Alert severity="error" className="rounded-xl font-sans text-xs">
              {errorMsg}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="expenseNumber"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Expense Voucher No *"
                  placeholder="e.g. EXP-2026-1024"
                  error={errors.expenseNumber?.message}
                  disabled={isLoading || isEdit}
                  {...field}
                />
              )}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                Category *
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e: SelectChangeEvent<string>) => field.onChange(e.target.value)}
                    disabled={isLoading}
                    displayEmpty
                    className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="" disabled className="!text-sm">
                      Select Category
                    </MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id} className="!text-sm">
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.categoryId?.message && (
                <p className="text-xs text-rose-500 mt-1 font-medium font-sans">{errors.categoryId.message}</p>
              )}
            </div>

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Expense Title *"
                  placeholder="e.g. Electric Bill July"
                  error={errors.title?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Voucher Amount (₹) *"
                  type="number"
                  placeholder="0.00"
                  error={errors.amount?.message}
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              )}
            />

            <Controller
              name="expenseDate"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Expense Date"
                  type="date"
                  error={errors.expenseDate?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                Payment Method
              </label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e: SelectChangeEvent<string>) => field.onChange(e.target.value)}
                    disabled={isLoading}
                    className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="Cash" className="!text-sm">Cash</MenuItem>
                    <MenuItem value="UPI" className="!text-sm">UPI / QR Code</MenuItem>
                    <MenuItem value="Card" className="!text-sm">Card Payment</MenuItem>
                    <MenuItem value="Bank Transfer" className="!text-sm">Bank Transfer</MenuItem>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                Payment Status *
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e: SelectChangeEvent<string>) => field.onChange(e.target.value)}
                    disabled={isLoading}
                    className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="paid" className="!text-sm text-emerald-600 font-semibold">Paid</MenuItem>
                    <MenuItem value="pending" className="!text-sm text-amber-600 font-semibold">Pending / Unpaid</MenuItem>
                  </Select>
                )}
              />
            </div>
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Short Description"
                placeholder="e.g. Paid Electricity Bill for Warehouse Building via UPI transaction reference ID 12345"
                error={errors.description?.message}
                disabled={isLoading}
                {...field}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                  Accounting Notes / Internal Remarks
                </label>
                <textarea
                  className="w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400 transition-all duration-200 min-h-[70px]"
                  placeholder="Audit notations, tax details, expense authorizations..."
                  disabled={isLoading}
                  {...field}
                />
              </div>
            )}
          />
        </DialogContent>

        <DialogActions className="!px-6 !pb-4 !gap-3 select-none">
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} className="!py-2.5 !px-4">
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={isLoading} className="!py-2.5 !px-4">
            {isEdit ? 'Save Changes' : 'Record Expense'}
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseFormDialog;
