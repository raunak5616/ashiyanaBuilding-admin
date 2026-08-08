import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import ImageUploader from '../components/ImageUploader';
import SaveBar from '../components/SaveBar';
import { ShopSettings, UpdateSettingsPayload } from '../settingsApi';
import { updateClientSettings } from '../settingsSlice';

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const generalSchema = z.object({
  shopName: z.string().trim().min(1, 'Shop name is required'),
  businessName: z.string().trim().min(1, 'Business name is required'),
  ownerName: z.string().trim().min(1, 'Owner name is required'),
  gstNumber: z.string().trim().toUpperCase().refine(v => !v || gstRegex.test(v), 'Invalid GST format').optional().or(z.literal('')),
  panNumber: z.string().trim().toUpperCase().refine(v => !v || panRegex.test(v), 'Invalid PAN format').optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
  line1: z.string().trim().optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  logo: z.object({
    url: z.string().nullable().optional(),
    publicId: z.string().nullable().optional(),
  }).nullable().optional(),
}).refine(data => {
  if (!data.gstNumber || !data.panNumber) return true;
  return data.gstNumber.slice(2, 12) === data.panNumber;
}, {
  message: 'GST number middle digits must match PAN number',
  path: ['panNumber'],
});

type GeneralFormType = z.infer<typeof generalSchema>;

interface GeneralSettingsProps {
  settings?: ShopSettings;
  onSave: (payload: UpdateSettingsPayload) => Promise<void>;
  isLoading: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSave, isLoading }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<GeneralFormType>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      shopName: '',
      businessName: '',
      ownerName: '',
      gstNumber: '',
      panNumber: '',
      email: '',
      phone: '',
      website: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      logo: null,
    },
  });

  const resetForm = () => {
    if (!settings) return;
    reset({
      shopName: settings.businessName || '',
      businessName: settings.businessName || '',
      ownerName: clientSettings.ownerName || '',
      gstNumber: settings.gstNumber || '',
      panNumber: settings.panNumber || '',
      email: settings.email || '',
      phone: settings.phone || '',
      website: clientSettings.website || '',
      line1: settings.address?.line1 || '',
      line2: settings.address?.line2 || '',
      city: settings.address?.city || '',
      state: settings.address?.state || '',
      pincode: settings.address?.pincode || '',
      country: settings.address?.country || 'India',
      logo: settings.logo || null,
    });
  };

  useEffect(() => {
    resetForm();
  }, [settings, clientSettings]);

  const onSubmit = async (data: GeneralFormType) => {
    // Save client settings
    dispatch(updateClientSettings({
      ownerName: data.ownerName,
      website: data.website,
    }));

    // Save server settings
    await onSave({
      businessName: data.businessName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      gstNumber: data.gstNumber || null,
      panNumber: data.panNumber || null,
      address: {
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      },
      logo: data.logo ? { url: data.logo.url || null, publicId: data.logo.publicId || null } : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingSection title="Shop Information" subtitle="Update your business identity and location details">
        {/* Logo Card */}
        <SettingCard title="Shop Logo" subheader="This logo will appear on your sale invoices and reports">
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <ImageUploader 
                value={field.value ? { url: field.value.url || null, publicId: field.value.publicId || null } : null} 
                onChange={field.onChange} 
                disabled={isLoading} 
              />
            )}
          />
        </SettingCard>

        {/* Identity Details Card */}
        <SettingCard title="Identity Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TextField
                {...register('shopName')}
                label="Shop Name"
                fullWidth
                error={!!errors.shopName}
                helperText={errors.shopName?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('businessName')}
                label="Business Name"
                fullWidth
                error={!!errors.businessName}
                helperText={errors.businessName?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('ownerName')}
                label="Owner Name"
                fullWidth
                error={!!errors.ownerName}
                helperText={errors.ownerName?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('website')}
                label="Website URL"
                fullWidth
                error={!!errors.website}
                helperText={errors.website?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('gstNumber')}
                label="GSTIN"
                fullWidth
                error={!!errors.gstNumber}
                helperText={errors.gstNumber?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('panNumber')}
                label="PAN"
                fullWidth
                error={!!errors.panNumber}
                helperText={errors.panNumber?.message}
                disabled={isLoading}
              />
            </div>
          </div>
        </SettingCard>

        {/* Contact Details Card */}
        <SettingCard title="Contact Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TextField
                {...register('email')}
                label="Public Email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('phone')}
                label="Phone Number"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={isLoading}
              />
            </div>
          </div>
        </SettingCard>

        {/* Address Card */}
        <SettingCard title="Business Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="sm:col-span-2 md:col-span-4">
              <TextField
                {...register('line1')}
                label="Address Line 1"
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div className="sm:col-span-2 md:col-span-4">
              <TextField
                {...register('line2')}
                label="Address Line 2"
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('city')}
                label="City"
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('state')}
                label="State"
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('pincode')}
                label="Pincode"
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <TextField
                {...register('country')}
                label="Country"
                fullWidth
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

export default GeneralSettings;
