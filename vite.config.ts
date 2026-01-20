import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize Vercel system env vars (process.env) over .env file vars
  // Also check for VITE_API_KEY as a fallback standard
  const apiKey = process.env.API_KEY || env.API_KEY || process.env.VITE_API_KEY || env.VITE_API_KEY || '';

  return {
    plugins: [react()],
    base: './', 
    define: {
      // Inject the key directly into the code
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});