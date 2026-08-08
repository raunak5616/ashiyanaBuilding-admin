import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/rootReducer';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import SaveBar from '../components/SaveBar';
import { updateClientSettings } from '../settingsSlice';

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  orderAlerts: z.boolean(),
});

type NotificationsFormType = z.infer<typeof notificationsSchema>;

interface NotificationSettingsProps {
  isLoading: boolean;
  onSuccessToast: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isLoading, onSuccessToast }) => {
  const dispatch = useDispatch();
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<NotificationsFormType>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      orderAlerts: true,
    },
  });

  const resetForm = () => {
    reset({
      emailNotifications: clientSettings.emailNotifications ?? true,
      smsNotifications: clientSettings.smsNotifications ?? false,
      lowStockAlerts: clientSettings.lowStockAlerts ?? true,
      orderAlerts: clientSettings.orderAlerts ?? true,
    });
  };

  useEffect(() => {
    resetForm();
  }, [clientSettings]);

  const onSubmit = (data: NotificationsFormType) => {
    dispatch(updateClientSettings(data));
    onSuccessToast();
    reset(data); // reset dirty state after save
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingSection title="Notification Settings" subtitle="Control alerts for low stock levels, customer sales, and PO confirmations">
        
        {/* Delivery Channels Card */}
        <SettingCard title="Notification Channels">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Controller
                name="emailNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Enable Email Notifications"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="smsNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Enable SMS Alerts (requires gateway)"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          </div>
        </SettingCard>

        {/* Operational Trigger Card */}
        <SettingCard title="Operational Alerts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Controller
                name="lowStockAlerts"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Alert when stock falls below threshold"
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="orderAlerts"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Alert on new Purchase Order status updates"
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

export default NotificationSettings;
