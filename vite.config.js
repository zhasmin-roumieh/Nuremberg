import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Nuremberg/' : '/',
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
