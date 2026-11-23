import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || '5173', 10);
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
        },
        '/materials': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
