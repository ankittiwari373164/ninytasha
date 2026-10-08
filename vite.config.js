import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Inline (empty) PostCSS config stops Vite from picking up a postcss.config.js in a parent folder
  css: { postcss: { plugins: [] } },
})
