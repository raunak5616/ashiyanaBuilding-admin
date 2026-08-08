import React from 'react';
import Chip from '@mui/material/Chip';

import SettingCard from '../components/SettingCard';
import SettingSection from '../components/SettingSection';
import { ShopSettings } from '../settingsApi';

interface BackupSettingsProps {
  settings?: ShopSettings;
}

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never Executed';

export const BackupSettings: React.FC<BackupSettingsProps> = ({ settings }) => {
  const backup = settings?.backupConfig;

  return (
    <SettingSection title="Database & Backup Config" subtitle="View system database restore points and automated cron parameters (Read Only)">
      
      {/* Backup Summary Card */}
      <SettingCard title="System Database Backups">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Last Backup Executed
              </span>
              <p className="text-sm font-bold text-slate-800">
                {fmtDate(backup?.lastBackupAt)}
              </p>
            </div>
          </div>
          <div>
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Cron Backup Frequency
              </span>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {backup?.frequency || 'Daily'}
              </p>
            </div>
          </div>
          <div>
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Auto Backup Status
              </span>
              <div className="mt-1">
                <Chip 
                  label={backup?.status === 'never_executed' ? 'Inactive / Never run' : 'Active'} 
                  color={backup?.status === 'never_executed' ? 'default' : 'success'} 
                  size="small" 
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </SettingCard>
    </SettingSection>
  );
};

export default BackupSettings;
