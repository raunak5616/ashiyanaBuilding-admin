import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SettingSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, subtitle, children }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary', fontSize: '1.1rem' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.85rem' }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default SettingSection;
