import React from 'react';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import EmailIcon from '@mui/icons-material/MailOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import WorkIcon from '@mui/icons-material/WorkOutlined';
import ContactPhoneIcon from '@mui/icons-material/ContactPhoneOutlined';
import SectionCard from './SectionCard';
import InfoCard from './InfoCard';
import { StaffUser } from '@/features/users/usersApi';

interface ProfileInformationProps {
  user: StaffUser;
  onEditClick?: React.ReactNode;
}

export const ProfileInformation: React.FC<ProfileInformationProps> = ({
  user,
  onEditClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Details Card */}
      <SectionCard
        title="Personal Information"
        subtitle="Primary contact and identification details"
        action={onEditClick}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <InfoCard
              label="Full Name"
              value={user.fullName}
              icon={<PersonIcon className="h-5 w-5" />}
            />
          </div>
          <div>
            <InfoCard
              label="Email Address"
              value={user.email}
              icon={<EmailIcon className="h-5 w-5" />}
            />
          </div>
          <div>
            <InfoCard
              label="Phone Number"
              value={user.phone}
              icon={<PhoneIcon className="h-5 w-5" />}
            />
          </div>
          <div>
            <InfoCard
              label="Department"
              value={user.department}
              icon={<WorkIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </SectionCard>

      {/* Emergency Contacts Card */}
      <SectionCard
        title="Emergency Contact"
        subtitle="Primary contact person in case of emergencies"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <InfoCard
              label="Contact Name"
              value={user.emergencyContact?.name}
              icon={<PersonIcon className="h-5 w-5" />}
            />
          </div>
          <div>
            <InfoCard
              label="Contact Phone"
              value={user.emergencyContact?.phone}
              icon={<PhoneIcon className="h-5 w-5" />}
            />
          </div>
          <div>
            <InfoCard
              label="Relationship"
              value={user.emergencyContact?.relation}
              icon={<ContactPhoneIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default ProfileInformation;
