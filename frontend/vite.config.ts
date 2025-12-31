import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Edge-Native-Whiteboard/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      // Proxy websockets
      '/ws': {
        target: 'http://127.0.0.1:8787',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})