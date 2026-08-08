import React from 'react';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import CalendarIcon from '@mui/icons-material/CalendarTodayOutlined';
import LoginIcon from '@mui/icons-material/LoginOutlined';
import SectionCard from './SectionCard';
import InfoCard from './InfoCard';
import StatusChip from '@/components/common/StatusChip';
import { StaffUser } from '@/features/users/usersApi';

interface AccountInformationProps {
  user: StaffUser;
}

export const AccountInformation: React.FC<AccountInformationProps> = ({ user }) => {
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      dateStyle: 'long',
    });
  };

  return (
    <SectionCard
      title="Account Information"
      subtitle="Organizational role and system membership details"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <InfoCard
            label="Designated Role"
            value={
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border border-slate-200/60 py-1 px-2.5 rounded-lg select-none">
                {user.role?.name || (user.isOwner ? 'Owner' : 'Staff')}
              </span>
            }
            icon={<ShieldIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Employee ID / Code"
            value={user.employeeId || 'N/A'}
            icon={<BadgeIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Account Status"
            value={
              <div className="inline-block scale-[0.85] origin-left select-none">
                <StatusChip
                  status={user.isActive ? 'success' : 'error'}
                  label={user.isActive ? 'Active' : 'Inactive'}
                />
              </div>
            }
            icon={<ShieldIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Joining Date"
            value={formatDate(user.joiningDate)}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Account Created"
            value={formatDateTime(user.createdAt)}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Last Login"
            value={formatDateTime(user.lastLoginAt)}
            icon={<LoginIcon className="h-5 w-5" />}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default AccountInformation;
