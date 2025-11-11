import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/spot_text/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/spot_text\/api/, '/spot_text/api')
      }
    }
  }
})
