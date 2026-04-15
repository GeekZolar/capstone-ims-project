import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api to the backend to avoid CORS in development
      '/api': {
        //target: 'http://20.171.55.206:3000',
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
