import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.woff2?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // global-exchange: tipos de cambio multi-moneda
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'exchange-rates-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // calc-invoices: tipo de cambio USD/CRC para la calculadora de cobros
            urlPattern: /^https:\/\/v6\.exchangerate-api\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'invoice-exchange-rate-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'JRV Tools',
        short_name: 'JRV Tools',
        description: 'Suite de mini-herramientas: CartWise, Tipo de Cambio Global y Calculadora de Cobros',
        theme_color: '#e8590c',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        lang: 'es',
        categories: ['shopping', 'finance', 'productivity', 'utilities'],
        icons: [
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'CartWise',
            short_name: 'CartWise',
            url: '/cart-wise',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'Tipo de Cambio Global',
            short_name: 'Tipo de Cambio',
            url: '/global-exchange',
            icons: [
              { src: 'global-exchange/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            ],
          },
          {
            name: 'Calculadora de Cobros',
            short_name: 'Cobros',
            url: '/calc-invoices',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'Calendario Lunar',
            short_name: 'Luna',
            url: '/lunar-garden',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'Dosificador Agrícola',
            short_name: 'Dosis',
            url: '/spray-mix',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'Ahorros',
            short_name: 'Ahorros',
            url: '/ahorros',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
