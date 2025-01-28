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
        dev: {
          logLevel: ['error'], // ✅ Correct: Array of strings
        }, // Fixed: logLevel should be a string, not an array
      },
      overlay: {
        position: 'tl', // Fixed: Corrected overlay position value
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(process.cwd(), 'node_modules'), // Fixed alias
      '@src': path.resolve(process.cwd(), 'src'), // Better aliasing format
    },
  },
  server: {
    port: PORT,
    host: true,
    strictPort: true, // Ensures Vite binds strictly to PORT
    allowedHosts: ['*'], // Prevents request blocking issues
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
