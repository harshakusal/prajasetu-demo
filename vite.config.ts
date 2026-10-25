import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], base: '/prajasetu-demo/', build: { chunkSizeWarningLimit: 1500 } });
