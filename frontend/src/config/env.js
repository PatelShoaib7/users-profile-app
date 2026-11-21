const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const clientEnv = {
  apiUrl: metaEnv.VITE_API_URL || '',
  backendOrigin: metaEnv.VITE_BACKEND_ORIGIN || '',
  storagePrefix: metaEnv.VITE_AUTH_STORAGE_PREFIX || 'ppm',
  demoAdminEmail: metaEnv.VITE_DEMO_ADMIN_EMAIL || '',
  demoAdminPassword: metaEnv.VITE_DEMO_ADMIN_PASSWORD || '',
  demoHrEmail: metaEnv.VITE_DEMO_HR_EMAIL || '',
  demoHrPassword: metaEnv.VITE_DEMO_HR_PASSWORD || '',
  demoUserEmail: metaEnv.VITE_DEMO_USER_EMAIL || '',
  demoUserPassword: metaEnv.VITE_DEMO_USER_PASSWORD || '',
};
