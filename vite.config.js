import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { base } from 'framer-motion/client'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      base: process.env.VITE_BASE_PATH || "/"
    }
  }
})
