import React from 'react';
import DevicesIcon from '@mui/icons-material/DevicesOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import KeyIcon from '@mui/icons-material/VpnKeyOutlined';
import SectionCard from './SectionCard';
import InfoCard from './InfoCard';

export const SecurityInformation: React.FC = () => {
  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    // Parse OS
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'macOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('like Mac') !== -1) os = 'iOS';

    // Parse Browser
    if (ua.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
    else if (ua.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Browser';
    else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';
    else if (ua.indexOf('Trident') !== -1) browser = 'Internet Explorer';
    else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg') !== -1) browser = 'Microsoft Edge';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Google Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Apple Safari';

    return { os, browser };
  };

  const { os, browser } = getDeviceDetails();

  return (
    <SectionCard
      title="Security & Session"
      subtitle="Details of your current active login session and system logs"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <InfoCard
            label="Session Status"
            value={
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold select-none text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </div>
            }
            icon={<SecurityIcon className="h-5 w-5" />}
          />
        </div>
        <div>
          <InfoCard
            label="Security Mode"
            value="Encrypted JWT Auth"
            icon={<KeyIcon className="h-5 w-5" />}
          />
        </div>
        <div className="sm:col-span-2">
          <InfoCard
            label="Device & Browser Info"
            value={`${os} — ${browser}`}
            icon={<DevicesIcon className="h-5 w-5" />}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default SecurityInformation;
