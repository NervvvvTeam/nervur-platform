import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    // Activer la compression CSS
    cssMinify: true,
    // Target moderne pour un code plus compact
    target: 'es2020',
    // Taille d'alerte plus stricte pour surveiller le bundle
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor React + Router en un seul chunk (réduit les requêtes HTTP)
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Séparer recharts (lourd, chargé à la demande)
          charts: ['recharts'],
        },
        // Noms de fichiers avec hash pour cache-busting optimal
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organiser les assets par type
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(assetInfo.name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (/\.css$/.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
