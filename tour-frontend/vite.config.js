import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stakeholders': 'http://localhost:8080',
      '/tours': 'http://localhost:8080',
    },
  },
})
