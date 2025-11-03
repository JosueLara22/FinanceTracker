
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Control Financiero',
      short_name: 'FinTrack',
      description: 'Una aplicación para el seguimiento de las finanzas personales.',
      theme_color: '#667eea',
      background_color: '#ffffff',
      icons: [
        {
          src: 'icon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: 'icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
      ]
    }
  })],
})
