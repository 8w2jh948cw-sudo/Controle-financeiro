import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  build: {
    // GitHub Pages in "Deploy from a branch" mode publishes this directory.
    // Keep the generated site versioned so Pages never receives the TSX sources.
    outDir: 'docs',
    emptyOutDir: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html'
      },
      manifest: {
        name: 'Meu Dinheiro', short_name: 'Dinheiro', description: 'Seu controle financeiro pessoal',
        theme_color: '#f5f5f7', background_color: '#f5f5f7', display: 'standalone', start_url: './',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      }
    })
  ]
})
