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

const inventorySchema = z.object({
  // Server fields
  lowStockThresholdDefault: z.number().int().nonnegative('Threshold must be zero or positive'),

  // Client fields
  negativeStockAllowed: z.boolean(),
  barcodeEnabled: z.boolean(),
  skuAutoGenerate: z.boolean(),
});

type InventoryFormType = z.infer<typeof inventorySchema>;

interface InventorySettingsProps {
  settings?: ShopSettings;
  onSave: (payload: UpdateSettingsPayload) => Promise<void>;
  isLoading: boolean;
}

export const InventorySettings: React.FC<InventorySettingsProps> = ({ settings, onSave, isLoading }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<InventoryFormType>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      lowStockThresholdDefault: 10,
      negativeStockAllowed: false,
      barcodeEnabled: false,
      skuAutoGenerate: true,
    },
  });

  const resetForm = () => {
    if (!settings) return;
    reset({
      lowStockThresholdDefault: settings.lowStockThresholdDefault ?? 10,
      negativeStockAllowed: clientSettings.negativeStockAllowed ?? false,
      barcodeEnabled: clientSettings.barcodeEnabled ?? false,
      skuAutoGenerate: clientSettings.skuAutoGenerate ?? true,
    });
  };

  useEffect(() => {
    resetForm();
  }, [settings, clientSettings]);

  const onSubmit = async (data: InventoryFormType) => {
    // Save client settings
    dispatch(updateClientSettings({
      negativeStockAllowed: data.negativeStockAllowed,
      barcodeEnabled: data.barcodeEnabled,
      skuAutoGenerate: data.skuAutoGenerate,
    }));

    // Save server settings
    await onSave({
      lowStockThresholdDefault: data.lowStockThresholdDefault,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingSection title="Inventory Settings" subtitle="Configure defaults for stock alerts, auto SKU code generation, and sales checks">
        
        {/* Alerts & Thresholds Card */}
        <SettingCard title="Stock Controls & Alerts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <TextField
                {...register('lowStockThresholdDefault', { valueAsNumber: true })}
                type="number"
                label="Default Low Stock Threshold Quantity"
                fullWidth
                error={!!errors.lowStockThresholdDefault}
                helperText={errors.lowStockThresholdDefault?.message}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center">
              <Controller
                name="negativeStockAllowed"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Allow Negative Stock Sales (Bypass checks)"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          </div>
        </SettingCard>

        {/* Scanning & Codes Card */}
        <SettingCard title="Item & SKU Management">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Controller
                name="skuAutoGenerate"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Auto Generate Product SKUs"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="barcodeEnabled"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Enable Barcode Scanning features"
                    disabled={isLoading}
                  />
                )}
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

export default InventorySettings;
