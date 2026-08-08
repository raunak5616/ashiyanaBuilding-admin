import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Slide from '@mui/material/Slide';

interface SaveBarProps {
  isVisible: boolean;
  isLoading: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const SaveBar: React.FC<SaveBarProps> = ({ isVisible, isLoading, onSave, onReset }) => {
  return (
    <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: { xs: 16, sm: 260 }, // offset for side navigation/sidebar if applicable
          right: 16,
          zIndex: 1100,
          p: 2,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          flexWrap: 'wrap',
          gap: 2,
          border: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 700 }}>
            Unsaved Changes
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            You have modified settings. Save your changes to apply them shop-wide.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button 
            variant="text" 
            color="inherit" 
            onClick={onReset} 
            disabled={isLoading}
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontSize: '0.8rem' }}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onSave}
            disabled={isLoading}
            size="small"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              px: 3, 
              fontSize: '0.8rem',
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': {
                bgcolor: 'text.secondary'
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default SaveBar;
