import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  Supplier,
} from '../supplierApi';

// GST & PAN validation regexes matching backend validation
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const supplierSchema = z
  .object({
    supplierCode: z
      .string()
      .trim()
      .min(1, 'Supplier code is required')
      .max(32, 'Supplier code must be 32 characters or less')
      .transform((val) => val.toUpperCase()),
    businessName: z.string().trim().min(1, 'Business name is required'),
    contactPerson: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),
    phone: z.string().trim().optional(),
    alternatePhone: z.string().trim().optional(),
    gstNumber: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || gstRegex.test(val), 'Invalid GST number format (15 characters)')
      .optional()
      .or(z.literal('')),
    panNumber: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => !val || panRegex.test(val), 'Invalid PAN format (10 characters)')
      .optional()
      .or(z.literal('')),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (!data.gstNumber || !data.panNumber) return true;
      return data.gstNumber.slice(2, 12) === data.panNumber;
    },
    {
      message: 'GST number and PAN are inconsistent. The PAN embedded in the GST must match.',
      path: ['panNumber'],
    }
  );

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormDialogProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

export const SupplierFormDialog: React.FC<SupplierFormDialogProps> = ({ open, supplier, onClose }) => {
  const isEdit = Boolean(supplier);
  const [errorMsg, setErrorMsg] = useState('');

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierCode: '',
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      alternatePhone: '',
      gstNumber: '',
      panNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        supplierCode: supplier.supplierCode || '',
        businessName: supplier.businessName || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        alternatePhone: supplier.alternatePhone || '',
        gstNumber: supplier.gstNumber || '',
        panNumber: supplier.panNumber || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || 'India',
        postalCode: supplier.postalCode || '',
        notes: supplier.notes || '',
      });
    } else {
      reset({
        supplierCode: '',
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        alternatePhone: '',
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        notes: '',
      });
    }
    setErrorMsg('');
  }, [supplier, reset, open]);

  const onSubmit = async (values: SupplierFormValues) => {
    setErrorMsg('');
    try {
      if (isEdit && supplier) {
        await updateSupplier({ id: supplier.id, body: values }).unwrap();
      } else {
        await createSupplier(values).unwrap();
      }
      onClose();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to save supplier. Please verify details.');
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
        {isEdit ? 'Edit Supplier Record' : 'Register New Supplier'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="!pb-6 !pt-2 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {errorMsg && (
            <Alert severity="error" className="rounded-xl font-sans text-xs">
              {errorMsg}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="supplierCode"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Supplier Code *"
                  placeholder="e.g. VEND-SUP-01"
                  error={errors.supplierCode?.message}
                  disabled={isLoading || isEdit} // Code is typically immutable once registered
                  {...field}
                />
              )}
            />

            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Business / Vendor Name *"
                  placeholder="e.g. Sharma Metal Traders"
                  error={errors.businessName?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Contact Person Name"
                  placeholder="e.g. Rajesh Sharma"
                  error={errors.contactPerson?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="e.g. billing@sharmatraders.com"
                  error={errors.email?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  error={errors.phone?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />

            <Controller
              name="alternatePhone"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Alternate Contact No"
                  placeholder="e.g. 0651234567"
                  error={errors.alternatePhone?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="gstNumber"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="GSTIN Number (Optional)"
                  placeholder="15-character GSTIN"
                  error={errors.gstNumber?.message}
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              )}
            />

            <Controller
              name="panNumber"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="PAN Card Number (Optional)"
                  placeholder="10-character PAN"
                  error={errors.panNumber?.message}
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              )}
            />
          </div>

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Office Address"
                placeholder="e.g. Plot 45, Sector IV, Kokar Industrial Area"
                error={errors.address?.message}
                disabled={isLoading}
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="City"
                    placeholder="e.g. Ranchi"
                    error={errors.city?.message}
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="State"
                    placeholder="e.g. Jharkhand"
                    error={errors.state?.message}
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Pincode"
                    placeholder="e.g. 834001"
                    error={errors.postalCode?.message}
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                  Supplier Remarks / Terms
                </label>
                <textarea
                  className="w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400 transition-all duration-200 min-h-[80px]"
                  placeholder="Payment terms, delivery schedules, or internal notes..."
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
            {isEdit ? 'Save Changes' : 'Register Supplier'}
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupplierFormDialog;
