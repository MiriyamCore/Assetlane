import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const themeSdkRoot = path.resolve(__dirname, '../../packages/theme-sdk/src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assetlane/theme-sdk/react': path.resolve(themeSdkRoot, 'react/index.ts'),
      '@assetlane/theme-sdk': path.resolve(themeSdkRoot, 'index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/theme-assets': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/theme-previews': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/branding-assets': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
})
