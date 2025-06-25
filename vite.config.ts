import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  // Ensure import.meta.env is available for compatibility with libraries
  define: {
    // Provide empty object as fallback for process.env
    'process.env': '{}',
  },
  // Configure server settings
  server: {
    port: 3000,
    // Turn off auto-opening browser
    proxy: {
      // Proxy API requests to solve CORS issues
      '/api': {
        target: 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
    open: false,
    // Enable access from any host
    host: '0.0.0.0',
    // Allow all origins for CORS
    cors: true,
    // Explicit allowlist for the ngrok domain
    allowedHosts: [
      // Host pattern to match all ngrok subdomains
      '.ngrok-free.app',
      'localhost',
    ],
    // Fix HMR for ngrok tunneling
    hmr: {
      // Use ngrok's https url for hot module reloading
      host: '80fb-152-117-98-99.ngrok-free.app',
      protocol: 'wss',
      clientPort: 443
    },
  },
  // Configure build settings
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
