import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/clean/',
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Task Distributor',
      short_name: 'Tasks',
      description: 'Task distribution application',
      theme_color: '#00d1b2',
      background_color: '#000000',
      display: 'standalone',
      start_url: '/clean/',
      scope: '/clean/',
      icons: [
        {
          src: '/clean/icons/icon-192x192.png',  // Ajout du préfixe /clean/
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/clean/icons/icon-512x512.png',  // Ajout du préfixe /clean/
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  })]
})
