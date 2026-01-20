import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  // Prioritize Vercel/System env vars over .env files
  // Ensure we get a string, defaulting to empty string if undefined
  const rawApiKey = process.env.API_KEY || process.env.VITE_API_KEY || env.API_KEY || env.VITE_API_KEY || '';

  return {
    plugins: [react()],
    base: './', 
    define: {
      // Inject the key globally as 'process.env.API_KEY'
      'process.env.API_KEY': JSON.stringify(rawApiKey)
    }
  };
});