import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fills %SITE_URL% in index.html and adds search-engine verification tags when their env vars are set:
//   VITE_SITE_URL                     e.g. https://www.ninytasha.com
//   VITE_GOOGLE_SITE_VERIFICATION     code from Google Search Console (HTML tag method)
//   VITE_BING_SITE_VERIFICATION       code from Bing Webmaster Tools (meta tag method)
function seoHtml(env) {
  const site = (env.VITE_SITE_URL || 'https://ninytashaexportspvtltd.vercel.app').replace(/\/$/, '')
  return {
    name: 'seo-html',
    transformIndexHtml: { order: 'pre', handler(html) {
      const tags = []
      if (env.VITE_GOOGLE_SITE_VERIFICATION) tags.push(`<meta name="google-site-verification" content="${env.VITE_GOOGLE_SITE_VERIFICATION}" />`)
      if (env.VITE_BING_SITE_VERIFICATION) tags.push(`<meta name="msvalidate.01" content="${env.VITE_BING_SITE_VERIFICATION}" />`)
      return html.replaceAll('%SITE_URL%', site).replace('<!-- webmaster verification tags are injected here at build time (see vite.config.js) -->', tags.join('\n    '))
    } },
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), seoHtml(env)],
    // Inline (empty) PostCSS config stops Vite from picking up a postcss.config.js in a parent folder
    css: { postcss: { plugins: [] } },
  }
})