export const API_CONFIG = {
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    PROFILE: '/users/me',
  },
};
