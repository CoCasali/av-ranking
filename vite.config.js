import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Nom du repo GitHub → project page servie sous /av-ranking/
const REPO_BASE = '/av-ranking/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // En build (GitHub Pages) on préfixe par le nom du repo ; en dev on reste à la racine.
  base: command === 'build' ? REPO_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Aqua Volley Club Aiguilhe',
        short_name: 'AV Ranking',
        description: "Classement des matchs de l'Aqua Volley Club Aiguilhe",
        lang: 'fr',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
}))
