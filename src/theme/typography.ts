import { THEME_CONSTANTS } from '@/constants/themeConstants';

export const typography = {
  fontFamily: THEME_CONSTANTS.FONTS.SANS,
  h1: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 900 },
  h2: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 900 },
  h3: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 900 },
  h4: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 850 },
  h5: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 800 },
  h6: { fontFamily: THEME_CONSTANTS.FONTS.HEADING, fontWeight: 800 },
  button: {
    fontFamily: THEME_CONSTANTS.FONTS.SANS,
    fontWeight: 700,
    textTransform: 'none' as const,
  },
  body1: {
    fontFamily: THEME_CONSTANTS.FONTS.SANS,
  },
  body2: {
    fontFamily: THEME_CONSTANTS.FONTS.SANS,
  },
  subtitle1: {
    fontFamily: THEME_CONSTANTS.FONTS.SANS,
    fontWeight: 650,
  },
  subtitle2: {
    fontFamily: THEME_CONSTANTS.FONTS.SANS,
    fontWeight: 600,
  },
};

export default typography;
