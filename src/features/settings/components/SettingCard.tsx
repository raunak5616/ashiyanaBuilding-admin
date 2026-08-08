import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

interface SettingCardProps {
  title?: string;
  subheader?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingCard: React.FC<SettingCardProps> = ({ title, subheader, children, actions }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderRadius: 3, 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'visible'
      }}
    >
      {(title || subheader) && (
        <>
          <div className="flex justify-between items-start px-6 py-4 select-none">
            <div className="space-y-0.5">
              {title && (
                <h3 className="text-xs font-black text-slate-800 font-heading">
                  {title}
                </h3>
              )}
              {subheader && (
                <p className="text-[10px] text-slate-400 font-sans">
                  {subheader}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center">{actions}</div>}
          </div>
          <Divider />
        </>
      )}
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default SettingCard;
