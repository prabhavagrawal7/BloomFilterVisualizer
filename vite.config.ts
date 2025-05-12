import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/BloomFilterVisualizer/',
  plugins: [react()],
  server: {
    open: true,
    port: 5173
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'bloom-filter': ['./src/utils/BloomFilter.ts', './src/utils/HistoryManager.ts'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
})
