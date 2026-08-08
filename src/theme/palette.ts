import { THEME_CONSTANTS } from '@/constants/themeConstants';

export const palette = {
  primary: {
    main: THEME_CONSTANTS.COLORS.PRIMARY,
    dark: THEME_CONSTANTS.COLORS.PRIMARY_DARK,
    contrastText: THEME_CONSTANTS.COLORS.SECONDARY,
  },
  secondary: {
    main: THEME_CONSTANTS.COLORS.SECONDARY,
    contrastText: THEME_CONSTANTS.COLORS.PRIMARY,
  },
  background: {
    default: THEME_CONSTANTS.COLORS.BACKGROUND,
    paper: THEME_CONSTANTS.COLORS.PAPER,
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
    primary: THEME_CONSTANTS.COLORS.SECONDARY,
    secondary: '#64748B', // slate-500
  },
  divider: THEME_CONSTANTS.COLORS.BORDER,
};

export default palette;
