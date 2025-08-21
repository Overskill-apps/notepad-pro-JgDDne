import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  define: {
    'process.env.VITE_APP_ID': JSON.stringify(process.env.VITE_APP_ID),
    'process.env.VITE_ENVIRONMENT': JSON.stringify(process.env.VITE_ENVIRONMENT),
    'process.env.VITE_R2_BASE_URL': JSON.stringify(process.env.VITE_R2_BASE_URL),
    'process.env.VITE_USE_LOCAL_ASSETS': JSON.stringify(process.env.VITE_USE_LOCAL_ASSETS),
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
