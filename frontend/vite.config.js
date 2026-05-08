import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host:'0.0.0.0',
    port:5173,
    allowedHosts: ['mboaseense.com', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr:{
      protocol:'wss',
      host:'mboaseense.com',  
      clientPort:443,
      path:'/@vite/hmr',  
    }
  },
})
