import axios from 'axios';
import { clientEnv } from '../config/env';

const STORAGE_TOKEN_KEY = `${clientEnv.storagePrefix}_auth_token`;
const STORAGE_USER_KEY = `${clientEnv.storagePrefix}_auth_user`;

if (!clientEnv.apiUrl) {
  console.warn('[Config] VITE_API_URL is not set in frontend/.env');
}

const axiosClient = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login')) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to reach backend server. Please verify the backend API is running.';

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.errors = error.response?.data?.errors || [];
    return Promise.reject(normalizedError);
  }
);

export { STORAGE_TOKEN_KEY, STORAGE_USER_KEY };
export default axiosClient;
