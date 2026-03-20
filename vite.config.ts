import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // Proxy /api to the API gateway to avoid CORS in development
      '/api': {
        target: 'http://20.171.55.206',
        changeOrigin: true,
      },
    },
  },
})
