// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/github_dashboard/',
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz',
      // Comprime especificamente JSON e outros assets grandes
      filter: (file) => {
        return file.endsWith('.json') || 
               file.endsWith('.js') || 
               file.endsWith('.css')
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react'
            }
            if (id.includes('@mui/material') || id.includes('@mui/system')) {
              return 'vendor-mui-core'
            }
            if (id.includes('@mui/icons')) {
              return 'vendor-mui-icons'
            }
            if (id.includes('@emotion')) {
              return 'vendor-emotion'
            }
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            if (id.includes('lodash')) {
              return 'vendor-utils'
            }
            return 'vendor-misc'
          }
          
          // App chunks
          if (id.includes('/src/components/dashboard/')) {
            return 'app-dashboard'
          }
          if (id.includes('/src/components/')) {
            return 'app-components'
          }
          if (id.includes('/src/data/')) {
            return 'app-data'
          }
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 400,
    sourcemap: false,
    assetsInlineLimit: 4096,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'lodash',
      '@emotion/react',
      '@emotion/styled',
      'hoist-non-react-statics'
    ],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      loader: {
        '.js': 'jsx'
      }
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})