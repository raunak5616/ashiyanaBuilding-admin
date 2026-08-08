import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import SaveBar from '../components/SaveBar';
import { ShopSettings, UpdateSettingsPayload } from '../settingsApi';
import { updateClientSettings } from '../settingsSlice';

const invoiceSchema = z.object({
  // Server fields
  invoicePrefix: z.string().trim().min(1, 'Invoice prefix is required'),
  invoiceStartingNumber: z.number().int().positive('Starting number must be positive'),
  purchaseOrderPrefix: z.string().trim().min(1, 'PO prefix is required'),
  
  // Client fields
  invoiceFooter: z.string().trim().optional(),
  termsAndConditions: z.string().trim().optional(),
  invoiceNotes: z.string().trim().optional(),
  showLogo: z.boolean(),
  showGst: z.boolean(),
  showSignature: z.boolean(),
  autoInvoiceNumber: z.boolean(),
});

type InvoiceFormType = z.infer<typeof invoiceSchema>;

interface InvoiceSettingsProps {
  settings?: ShopSettings;
  onSave: (payload: UpdateSettingsPayload) => Promise<void>;
  isLoading: boolean;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ settings, onSave, isLoading }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<InvoiceFormType>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoicePrefix: 'INV',
      invoiceStartingNumber: 1,
      purchaseOrderPrefix: 'PO',
      invoiceFooter: '',
      termsAndConditions: '',
      invoiceNotes: '',
      showLogo: true,
      showGst: true,
      showSignature: true,
      autoInvoiceNumber: true,
    },
  });

  const resetForm = () => {
    if (!settings) return;
    reset({
      invoicePrefix: settings.invoicePrefix || 'INV',
      invoiceStartingNumber: settings.invoiceStartingNumber || 1,
      purchaseOrderPrefix: settings.purchaseOrderPrefix || 'PO',
      invoiceFooter: clientSettings.invoiceFooter || '',
      termsAndConditions: clientSettings.termsAndConditions || '',
      invoiceNotes: clientSettings.invoiceNotes || '',
      showLogo: clientSettings.showLogo ?? true,
      showGst: clientSettings.showGst ?? true,
      showSignature: clientSettings.showSignature ?? true,
      autoInvoiceNumber: clientSettings.autoInvoiceNumber ?? true,
    });
  };

  useEffect(() => {
    resetForm();
  }, [settings, clientSettings]);

  const onSubmit = async (data: InvoiceFormType) => {
    // Save client settings
    dispatch(updateClientSettings({
      invoiceFooter: data.invoiceFooter,
      termsAndConditions: data.termsAndConditions,
      invoiceNotes: data.invoiceNotes,
      showLogo: data.showLogo,
      showGst: data.showGst,
      showSignature: data.showSignature,
      autoInvoiceNumber: data.autoInvoiceNumber,
    }));

    // Save server settings
    await onSave({
      invoicePrefix: data.invoicePrefix,
      invoiceStartingNumber: data.invoiceStartingNumber,
      purchaseOrderPrefix: data.purchaseOrderPrefix,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingSection title="Invoice Settings" subtitle="Configure serial generation and display rules for sales invoices">
        
        {/* Serial Generation Card */}
        <SettingCard title="Serial & Sequence Numbering">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <TextField
                {...register('invoicePrefix')}
                label="Invoice Prefix"
                fullWidth
                error={!!errors.invoicePrefix}
                helperText={errors.invoicePrefix?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('invoiceStartingNumber', { valueAsNumber: true })}
                type="number"
                label="Invoice Starting Number"
                fullWidth
                error={!!errors.invoiceStartingNumber}
                helperText={errors.invoiceStartingNumber?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('purchaseOrderPrefix')}
                label="Purchase Order Prefix"
                fullWidth
                error={!!errors.purchaseOrderPrefix}
                helperText={errors.purchaseOrderPrefix?.message}
                disabled={isLoading}
              />
            </div>
          </div>
        </SettingCard>

        {/* Branding & Visuals Card */}
        <SettingCard title="Branding & Visuals">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Controller
                name="showLogo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Show Logo on Invoices"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="showGst"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Show GSTIN on Invoices"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="showSignature"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Show Authorized Signature box"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="autoInvoiceNumber"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Auto Generate Serial (Manual editing blocked)"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          </div>
        </SettingCard>

        {/* Typography & Disclaimers Card */}
        <SettingCard title="Typography & Disclaimers">
          <div className="space-y-6">
            <div>
              <TextField
                {...register('invoiceFooter')}
                label="Invoice Footer Message"
                fullWidth
                placeholder="Thank you for shopping with us!"
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('invoiceNotes')}
                label="Default Notes / Remarks"
                fullWidth
                multiline
                rows={2}
                placeholder="Bank Account Details: Aashiyana Building Materials..."
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('termsAndConditions')}
                label="Terms & Conditions"
                fullWidth
                multiline
                rows={3}
                placeholder="1. Goods once sold will not be accepted..."
                disabled={isLoading}
              />
            </div>
          </div>
        </SettingCard>
      </SettingSection>

      <SaveBar
        isVisible={isDirty}
        isLoading={isLoading}
        onSave={handleSubmit(onSubmit)}
        onReset={resetForm}
      />
    </form>
  );
};

export default InvoiceSettings;
