import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    headers: {
      // Anti-clickjacking
      'X-Frame-Options': 'DENY',
      // Anti-MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // XSS filter (navigateurs anciens)
      'X-XSS-Protection': '1; mode=block',
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Permissions restrictives
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      // CORS restrictif — uniquement le même domaine
      'Access-Control-Allow-Origin': 'self',
    },
  },
  build: {
    // Pas de sourcemaps en production (fuite d'info code source)
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
