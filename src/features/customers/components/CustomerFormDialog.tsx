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
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  Customer,
} from '../customerApi';

// GST & PAN validation regexes
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const customerSchema = z
  .object({
    customerCode: z
      .string()
      .trim()
      .min(1, 'Customer code is required')
      .max(32, 'Customer code must be 32 characters or less')
      .transform((val) => val.toUpperCase()),
    customerType: z.enum(['individual', 'business']),
    customerName: z.string().trim().min(1, 'Customer name is required'),
    businessName: z.string().trim().optional(),
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
    creditLimit: z.number().min(0, 'Credit limit cannot be negative').optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.customerType !== 'business') return true;
      return Boolean(data.businessName && data.businessName.trim().length > 0);
    },
    {
      message: 'Business name is required for business customers.',
      path: ['businessName'],
    }
  )
  .refine(
    (data) => {
      if (data.customerType !== 'business') return true;
      return Boolean(data.gstNumber && data.gstNumber.trim().length > 0);
    },
    {
      message: 'GSTIN is required for business customers.',
      path: ['gstNumber'],
    }
  )
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

// Define custom interface to prevent type resolver mismatches
interface CustomerFormValues {
  customerCode: string;
  customerType: 'individual' | 'business';
  customerName: string;
  businessName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  creditLimit?: number;
  notes?: string;
}

interface CustomerFormDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({ open, customer, onClose }) => {
  const isEdit = Boolean(customer);
  const [errorMsg, setErrorMsg] = useState('');

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerCode: '',
      customerType: 'individual',
      customerName: '',
      businessName: '',
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
      creditLimit: 0,
      notes: '',
    },
  });

  const selectedType = watch('customerType');

  useEffect(() => {
    if (customer) {
      reset({
        customerCode: customer.customerCode || '',
        customerType: customer.customerType || 'individual',
        customerName: customer.customerName || '',
        businessName: customer.businessName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        gstNumber: customer.gstNumber || '',
        panNumber: customer.panNumber || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || 'India',
        postalCode: customer.postalCode || '',
        creditLimit: customer.creditLimit ? customer.creditLimit / 100 : 0,
        notes: customer.notes || '',
      });
    } else {
      reset({
        customerCode: '',
        customerType: 'individual',
        customerName: '',
        businessName: '',
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
        creditLimit: 0,
        notes: '',
      });
    }
    setErrorMsg('');
  }, [customer, reset, open]);

  const onSubmit = async (values: CustomerFormValues) => {
    setErrorMsg('');
    // Convert creditLimit back to paise (integers)
    const payload = {
      ...values,
      creditLimit: values.creditLimit ? Math.round(values.creditLimit * 100) : undefined,
    };

    try {
      if (isEdit && customer) {
        await updateCustomer({ id: customer.id, body: payload }).unwrap();
      } else {
        await createCustomer(payload).unwrap();
      }
      onClose();
    } catch (err) {
      setErrorMsg((err as any)?.data?.message || 'Failed to save customer. Please verify details.');
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
        {isEdit ? 'Edit Customer Record' : 'Register New Customer'}
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
              name="customerCode"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Customer Code *"
                  placeholder="e.g. CUST-01"
                  error={errors.customerCode?.message}
                  disabled={isLoading || isEdit}
                  {...field}
                />
              )}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold uppercase tracking-wider font-sans text-slate-500 select-none">
                Customer Type *
              </label>
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e: SelectChangeEvent<string>) => field.onChange(e.target.value)}
                    disabled={isLoading}
                    className="!font-sans !text-sm !bg-slate-50 !rounded-xl !border-slate-200"
                    classes={{ select: '!py-2.5 !px-3.5' }}
                  >
                    <MenuItem value="individual" className="!text-sm">Individual / B2C</MenuItem>
                    <MenuItem value="business" className="!text-sm">Business / B2B</MenuItem>
                  </Select>
                )}
              />
            </div>

            <Controller
              name="customerName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Customer Name *"
                  placeholder="e.g. Rajesh Kumar"
                  error={errors.customerName?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          </div>

          {selectedType === 'business' && (
            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Business / Trade Name *"
                  placeholder="e.g. Kumar Hardware Store"
                  error={errors.businessName?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="e.g. rajesh@gmail.com"
                  error={errors.email?.message}
                  disabled={isLoading}
                  {...field}
                />
              )}
            />

            <Controller
              name="creditLimit"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Credit Limit Amount (₹)"
                  type="number"
                  placeholder="e.g. 50000"
                  error={errors.creditLimit?.message}
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(Math.max(0, parseFloat(e.target.value) || 0))}
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
                  label={selectedType === 'business' ? 'GSTIN Number *' : 'GSTIN Number (Optional)'}
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
                label="Billing / Shipping Address"
                placeholder="e.g. Flat 301, Shiv Mandir Lane"
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
                  Customer Remarks / Credit Terms
                </label>
                <textarea
                  className="w-full px-4 py-2.5 text-sm border rounded-xl font-sans focus:outline-none focus:ring-1 bg-slate-50 border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-400 transition-all duration-200 min-h-[80px]"
                  placeholder="Credit terms, special pricing, or internal notes..."
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
            {isEdit ? 'Save Changes' : 'Register Customer'}
          </PrimaryButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerFormDialog;
