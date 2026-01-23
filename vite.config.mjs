import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    ...(process.env.VITE_ENABLE_API_PROXY === 'true'
      ? {
          proxy: {
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : {}),
  },
})
