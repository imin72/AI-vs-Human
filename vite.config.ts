import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to prevent TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: './', // Use relative base path to support deployment to subdirectories (e.g. GitHub Pages)
    define: {
      // Allow usage of process.env.API_KEY in the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});