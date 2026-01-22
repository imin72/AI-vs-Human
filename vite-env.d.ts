// Manually define Vite types as vite/client is missing in the environment or path references

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly url: string;
  readonly env: ImportMetaEnv;
  glob(pattern: string): Record<string, () => Promise<any>>;
  globEager(pattern: string): Record<string, any>;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

// Ensure CSS imports don't throw errors if vite/client is removed
declare module '*.css';
