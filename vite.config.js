import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]react-router/ },
            { name: 'motion', test: /node_modules[\\/]framer-motion/ },
            { name: 'icons', test: /node_modules[\\/]react-icons/ }
          ]
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5050'
    }
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:5050'
    }
  }
})
