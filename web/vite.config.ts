import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          // Remove Vite's default internal error listener to prevent ECONNREFUSED terminal spam
          proxy.removeAllListeners('error');
          proxy.on('error', (err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ error: 'Backend offline', code: (err as any).code || 'PROXY_ERROR' }));
            }
          });
        },
      },
    },
  },
});
