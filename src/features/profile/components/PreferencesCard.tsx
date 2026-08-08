import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Brightness4Icon from '@mui/icons-material/Brightness4Outlined';
import TranslateIcon from '@mui/icons-material/TranslateOutlined';
import PublicIcon from '@mui/icons-material/PublicOutlined';
import SectionCard from './SectionCard';
import InfoCard from './InfoCard';
import { RootState } from '@/app/rootReducer';
import { setThemeMode, updateClientSettings } from '@/features/settings/settingsSlice';

export const PreferencesCard: React.FC = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);
  const clientSettings = useSelector((state: RootState) => state.settings.clientSettings);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setThemeMode(event.target.checked ? 'dark' : 'light'));
  };

  const handleNotificationToggle = (field: 'emailNotifications' | 'smsNotifications' | 'lowStockAlerts' | 'orderAlerts') => {
    dispatch(
      updateClientSettings({
        [field]: !clientSettings[field],
      })
    );
  };

  // Get local browser timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return (
    <div className="space-y-6">
      {/* Visual & Localization Preferences */}
      <SectionCard
        title="Application Preferences"
        subtitle="Theme and localized formats settings"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Dark Mode toggle */}
          <div>
            <InfoCard
              label="Application Theme"
              value={
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeMode === 'dark'}
                      onChange={handleThemeChange}
                      size="small"
                    />
                  }
                  label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  className="!m-0 !font-sans"
                  classes={{ label: '!text-sm !font-semibold !text-slate-700' }}
                />
              }
              icon={<Brightness4Icon className="h-5 w-5" />}
            />
          </div>

          {/* Language Selection */}
          <div>
            <InfoCard
              label="Language"
              value={
                <Select
                  value="en"
                  size="small"
                  className="!font-sans !text-xs !bg-white !rounded-xl !border-slate-200 !w-32"
                  classes={{ select: '!py-1.5 !px-3' }}
                  disabled
                >
                  <MenuItem value="en" className="!text-xs !font-sans">
                    English (US)
                  </MenuItem>
                </Select>
              }
              icon={<TranslateIcon className="h-5 w-5" />}
            />
          </div>

          {/* Timezone (Read-only) */}
          <div className="sm:col-span-2">
            <InfoCard
              label="Local Timezone"
              value={localTimezone}
              icon={<PublicIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </SectionCard>

      {/* Notifications Preferences */}
      <SectionCard
        title="Notification Preferences"
        subtitle="Configure which alerts you want to receive"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-2 border-b border-slate-100/50">
            <FormControlLabel
              control={
                <Switch
                  checked={clientSettings.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                  size="small"
                />
              }
              label={
                <div>
                  <p className="text-xs font-bold text-slate-700">Email Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Receive stock reports and invoices via email</p>
                </div>
              }
              className="!m-0 !w-full"
            />
          </div>

          <div className="p-2 border-b border-slate-100/50">
            <FormControlLabel
              control={
                <Switch
                  checked={clientSettings.smsNotifications}
                  onChange={() => handleNotificationToggle('smsNotifications')}
                  size="small"
                />
              }
              label={
                <div>
                  <p className="text-xs font-bold text-slate-700">SMS Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Receive transactional summaries via mobile text</p>
                </div>
              }
              className="!m-0 !w-full"
            />
          </div>

          <div className="p-2">
            <FormControlLabel
              control={
                <Switch
                  checked={clientSettings.lowStockAlerts}
                  onChange={() => handleNotificationToggle('lowStockAlerts')}
                  size="small"
                />
              }
              label={
                <div>
                  <p className="text-xs font-bold text-slate-700">Inventory Stock Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Get warned when items reach minimum levels</p>
                </div>
              }
              className="!m-0 !w-full"
            />
          </div>

          <div className="p-2">
            <FormControlLabel
              control={
                <Switch
                  checked={clientSettings.orderAlerts}
                  onChange={() => handleNotificationToggle('orderAlerts')}
                  size="small"
                />
              }
              label={
                <div>
                  <p className="text-xs font-bold text-slate-700">Order Updates</p>
                  <p className="text-[10px] text-slate-400 font-medium">Receive status updates on purchase and sales orders</p>
                </div>
              }
              className="!m-0 !w-full"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default PreferencesCard;
