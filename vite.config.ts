import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic' // 解决React 18+兼容性问题 
    })
  ],
  server: {
    port: 3000 
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})