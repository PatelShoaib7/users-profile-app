const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const clientEnv = {
  apiUrl: metaEnv.VITE_API_URL || '/api',
  backendOrigin: metaEnv.VITE_BACKEND_ORIGIN || '',
  storagePrefix: metaEnv.VITE_AUTH_STORAGE_PREFIX || 'ppm',
  enableDemoLogin: metaEnv.VITE_ENABLE_DEMO_LOGIN !== 'false',
  demoAdminEmail: metaEnv.VITE_DEMO_ADMIN_EMAIL || '',
  demoHrEmail: metaEnv.VITE_DEMO_HR_EMAIL || '',
  demoUserEmail: metaEnv.VITE_DEMO_USER_EMAIL || '',
};
