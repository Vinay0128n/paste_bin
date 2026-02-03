import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: process.env.VITE_API_URL
      ? {
          '/api': { target: process.env.VITE_API_URL, changeOrigin: true },
          '/p': { target: process.env.VITE_API_URL, changeOrigin: true },
        }
      : {},
  },
});
