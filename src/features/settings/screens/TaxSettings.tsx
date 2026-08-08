import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import SaveBar from '../components/SaveBar';
import { ShopSettings, UpdateSettingsPayload } from '../settingsApi';
import { updateClientSettings } from '../settingsSlice';

const taxSchema = z.object({
  // Server fields
  currency: z.string().trim().min(1),
  defaultTaxRate: z.number().nonnegative('Tax rate must be positive'),

  // Client fields
  gstEnabled: z.boolean(),
  inclusiveExclusiveTax: z.enum(['inclusive', 'exclusive']),
});

type TaxFormType = z.infer<typeof taxSchema>;

interface TaxSettingsProps {
  settings?: ShopSettings;
  onSave: (payload: UpdateSettingsPayload) => Promise<void>;
  isLoading: boolean;
}

const currencies = [
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
];

export const TaxSettings: React.FC<TaxSettingsProps> = ({ settings, onSave, isLoading }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<TaxFormType>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      currency: 'INR',
      defaultTaxRate: 18,
      gstEnabled: true,
      inclusiveExclusiveTax: 'exclusive',
    },
  });

  const selectedCurrency = watch('currency');
  const currencySymbol = selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : '£';

  const resetForm = () => {
    if (!settings) return;
    reset({
      currency: settings.currency || 'INR',
      defaultTaxRate: settings.taxConfiguration?.defaultTaxRate ?? 18,
      gstEnabled: clientSettings.gstEnabled ?? true,
      inclusiveExclusiveTax: clientSettings.inclusiveExclusiveTax || 'exclusive',
    });
  };

  useEffect(() => {
    resetForm();
  }, [settings, clientSettings]);

  const onSubmit = async (data: TaxFormType) => {
    // Save client settings
    dispatch(updateClientSettings({
      gstEnabled: data.gstEnabled,
      inclusiveExclusiveTax: data.inclusiveExclusiveTax,
    }));

    // Save server settings
    await onSave({
      currency: data.currency,
      taxConfiguration: {
        defaultTaxRate: data.defaultTaxRate,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingSection title="Tax & Currency Settings" subtitle="Configure defaults for tax calculation slabs and currency symbols">
        
        {/* Compliance Configuration Card */}
        <SettingCard title="Tax Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Controller
                name="gstEnabled"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Enable GST Calculations"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <TextField
                {...register('defaultTaxRate', { valueAsNumber: true })}
                type="number"
                label="Default GST Tax Slab (%)"
                fullWidth
                error={!!errors.defaultTaxRate}
                helperText={errors.defaultTaxRate?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.85rem' }}>
                Tax Slab Inclusion
              </Typography>
              <Controller
                name="inclusiveExclusiveTax"
                control={control}
                render={({ field }) => (
                  <RadioGroup row value={field.value} onChange={field.onChange}>
                    <FormControlLabel value="exclusive" control={<Radio size="small" />} label="Tax Exclusive" disabled={isLoading} />
                    <FormControlLabel value="inclusive" control={<Radio size="small" />} label="Tax Inclusive" disabled={isLoading} />
                  </RadioGroup>
                )}
              />
            </div>
          </div>
        </SettingCard>

        {/* Currency Formatting Card */}
        <SettingCard title="Currency & Region">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TextField
                {...register('currency')}
                select
                label="Default Currency"
                fullWidth
                disabled={isLoading}
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div>
              <TextField
                label="Currency Symbol (Read Only)"
                value={currencySymbol}
                fullWidth
                disabled
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

export default TaxSettings;
