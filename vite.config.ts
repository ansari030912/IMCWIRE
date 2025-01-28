import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: 'error' }, // Fixed: logLevel should be a string, not an array
      },
      overlay: {
        position: 'top-left', // Fixed: Corrected overlay position value
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(process.cwd(), 'node_modules'),
      '@src': path.resolve(process.cwd(), 'src'), // More conventional aliasing
    },
  },
  server: {
    port: PORT,
    host: true,
    strictPort: true, // Ensures Vite binds strictly to PORT
    allowedHosts: ['*'], // Allows all hosts to prevent request blocking issues
  },
  preview: {
    port: PORT,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist', // Must match Netlify's publish directory in netlify.toml
  },
});
