import { createTheme } from '@mui/material/styles';
import { THEME_CONSTANTS } from '@/constants/themeConstants';
import typography from './typography';

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: THEME_CONSTANTS.COLORS.PRIMARY,
        dark: THEME_CONSTANTS.COLORS.PRIMARY_DARK,
        contrastText: isDark ? '#FFFFFF' : THEME_CONSTANTS.COLORS.SECONDARY,
      },
      secondary: {
        main: isDark ? '#FFFFFF' : THEME_CONSTANTS.COLORS.SECONDARY,
        contrastText: THEME_CONSTANTS.COLORS.PRIMARY,
      },
      background: {
        default: isDark ? '#0F172A' : THEME_CONSTANTS.COLORS.BACKGROUND,
        paper: isDark ? '#1E293B' : THEME_CONSTANTS.COLORS.PAPER,
      },
      success: {
        main: THEME_CONSTANTS.COLORS.SUCCESS,
      },
      warning: {
        main: THEME_CONSTANTS.COLORS.WARNING,
      },
      error: {
        main: THEME_CONSTANTS.COLORS.ERROR,
      },
      text: {
        primary: isDark ? '#F8FAFC' : THEME_CONSTANTS.COLORS.SECONDARY,
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: isDark ? '#334155' : THEME_CONSTANTS.COLORS.BORDER,
    },
    typography,
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '10px 20px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          },
        },
      },
    },
  });
};

export default getTheme;
