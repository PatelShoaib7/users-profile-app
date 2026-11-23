const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const clientEnv = {
  apiUrl: metaEnv.VITE_API_URL || '',
  backendOrigin: metaEnv.VITE_BACKEND_ORIGIN || '',
  storagePrefix: metaEnv.VITE_AUTH_STORAGE_PREFIX || 'ppm',
  enableDemoLogin: metaEnv.VITE_ENABLE_DEMO_LOGIN === 'true',
};
