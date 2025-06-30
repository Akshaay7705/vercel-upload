import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'pyodide'], // Exclude both lucide-react and pyodide
  },
  server: {
    fs: {
      allow: ['node_modules', 'public', 'src'], // Add src to allow list
    },
  },
  build: {
    target: 'esnext', // Ensure compatibility with modern JS features for WebAssembly
  },
  resolve: {
    conditions: ['browser'], // Prioritize browser-compatible modules
  },
});