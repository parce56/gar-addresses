import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: process.env.APP_PORT || 5173,
    host: true
  },
  envPrefix: ['APP_','API_','DEBOUNCE_']
})