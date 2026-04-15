import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          gmaps: ['@react-google-maps/api'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
