export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
};
