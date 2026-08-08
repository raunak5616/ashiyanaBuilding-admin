import React, { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Icons
import StoreIcon from '@mui/icons-material/StorefrontOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import PercentIcon from '@mui/icons-material/PercentOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import BackupIcon from '@mui/icons-material/BackupOutlined';

// Sub components
import SettingsSkeleton from './components/SettingsSkeleton';
import GeneralSettings from './screens/GeneralSettings';
import InvoiceSettings from './screens/InvoiceSettings';
import TaxSettings from './screens/TaxSettings';
import InventorySettings from './screens/InventorySettings';
import NotificationSettings from './screens/NotificationSettings';
import SecuritySettings from './screens/SecuritySettings';
import BackupSettings from './screens/BackupSettings';

// Hooks
import { useGetSettingsQuery, useUpdateSettingsMutation, UpdateSettingsPayload } from './settingsApi';

type TabId = 'general' | 'invoice' | 'tax' | 'inventory' | 'notifications' | 'security' | 'backup';

const TABS = [
  { id: 'general' as TabId, label: 'General', desc: 'Shop identity & info', icon: StoreIcon },
  { id: 'invoice' as TabId, label: 'Invoice', desc: 'Prefix & numbering rules', icon: ReceiptIcon },
  { id: 'tax' as TabId, label: 'Tax Settings', desc: 'GST rate & currency defaults', icon: PercentIcon },
  { id: 'inventory' as TabId, label: 'Inventory', desc: 'Alert trigger settings', icon: InventoryIcon },
  { id: 'notifications' as TabId, label: 'Notifications', desc: 'Email & SMS alerts config', icon: NotificationsIcon },
  { id: 'security' as TabId, label: 'Security', desc: 'Change account password', icon: SecurityIcon },
  { id: 'backup' as TabId, label: 'Backup', desc: 'Retrieve restore logs', icon: BackupIcon },
];

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: settingsData, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const handleSave = async (payload: UpdateSettingsPayload) => {
    try {
      await updateSettings(payload).unwrap();
      setToast({
        open: true,
        message: 'Shop settings updated successfully.',
        severity: 'success',
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.data?.message || 'Failed to update settings.',
        severity: 'error',
      });
    }
  };

  const handleToastClose = () => setToast((prev) => ({ ...prev, open: false }));

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const renderActiveScreen = () => {
    const settings = settingsData?.data;
    switch (activeTab) {
      case 'general':
        return <GeneralSettings settings={settings} onSave={handleSave} isLoading={isUpdating} />;
      case 'invoice':
        return <InvoiceSettings settings={settings} onSave={handleSave} isLoading={isUpdating} />;
      case 'tax':
        return <TaxSettings settings={settings} onSave={handleSave} isLoading={isUpdating} />;
      case 'inventory':
        return <InventorySettings settings={settings} onSave={handleSave} isLoading={isUpdating} />;
      case 'notifications':
        return (
          <NotificationSettings
            isLoading={isUpdating}
            onSuccessToast={() => setToast({ open: true, message: 'Notification preferences saved locally.', severity: 'success' })}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            onSuccessToast={(msg) => setToast({ open: true, message: msg, severity: 'success' })}
            onErrorToast={(msg) => setToast({ open: true, message: msg, severity: 'error' })}
          />
        );
      case 'backup':
        return <BackupSettings settings={settings} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 4, minHeight: '80vh' }}>
      {/* Sidebar Tabs */}
      <Paper
        variant="outlined"
        sx={{
          width: isMobile ? '100%' : 240,
          flexShrink: 0,
          borderRadius: 3,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1.5,
          alignSelf: 'flex-start',
        }}
      >
        <List sx={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: 'auto', p: 0, gap: 0.5 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <ListItemButton
                key={tab.id}
                selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  whiteSpace: 'nowrap',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                {!isMobile && (
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{tab.label}</Typography>}
                    secondary={<Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: 'text.secondary' }}>{tab.desc}</Typography>}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Paper>

      {/* Screen Form Content */}
      <Box sx={{ flexGrow: 1 }}>{renderActiveScreen()}</Box>

      {/* Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={handleToastClose} sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
