// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying request:', req.url);
          });
        },
      },
    },
  },

  // Vitest config
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      reporter: ['text', 'lcov'],
    },
    alias: {
      '\\.(mp4|webm|png|jpg|jpeg|gif|svg)$': '/src/test/__mocks__/fileMock.ts',
    },
  },
});
