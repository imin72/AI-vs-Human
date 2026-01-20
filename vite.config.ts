
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const rawApiKey = process.env.API_KEY || process.env.VITE_API_KEY || env.API_KEY || env.VITE_API_KEY || '';

  return {
    plugins: [react()],
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(rawApiKey)
    },
    build: {
      chunkSizeWarningLimit: 1000, // 500kb -> 1000kb로 상향
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 무거운 라이브러리를 별도 청크로 분리
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor-core';
            }
          }
        }
      }
    }
  };
});
