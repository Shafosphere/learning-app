import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
      '/report': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
      '/word': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
      '/analytics': {
        target: 'http://192.168.0.113:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});