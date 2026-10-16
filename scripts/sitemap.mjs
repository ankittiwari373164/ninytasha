// Generates public/sitemap.xml and public/robots.txt before every build.
// Site URL comes from VITE_SITE_URL (set it in Vercel when you add a custom domain).
import { writeFileSync } from 'node:fs'
import { PRODUCTS, GROUPS, CATEGORIES } from '../src/data/products.js'

const SITE = (process.env.VITE_SITE_URL || 'https://ninytashaexportspvtltd.vercel.app').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)
const pages = [
  ['/', '1.0', 'weekly'], ['/shop', '0.9', 'weekly'], ['/about', '0.7', 'monthly'], ['/contact', '0.7', 'monthly'],
  ['/corporate', '0.8', 'monthly'], ['/faq', '0.5', 'monthly'], ['/sitemap', '0.3', 'monthly'],
  ['/privacy-policy', '0.3', 'yearly'], ['/terms-and-conditions', '0.3', 'yearly'],
  ['/cancellation-and-refund-policy', '0.3', 'yearly'], ['/shipping-policy', '0.3', 'yearly'],
  ...GROUPS.map((g) => [`/shop/${g.slug}`, '0.8', 'weekly']),
  ...CATEGORIES.filter((c) => !GROUPS.some((g) => g.slug === c.slug)).map((c) => [`/shop/${c.slug}`, '0.7', 'weekly']),
]
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const url = ([loc, pr, cf], img) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>${img || ''}\n  </url>`
const productUrls = PRODUCTS.filter((p) => p.active !== false).map((p) =>
  url([`/product/${p.id}`, '0.8', 'weekly'], (p.images || []).map((i) => `\n    <image:image><image:loc>${SITE}${i}</image:loc><image:title>${esc(p.name)}</image:title></image:image>`).join('')))

writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...pages.map((p) => url(p)), ...productUrls].join('\n')}
</urlset>
`)
writeFileSync('public/robots.txt', `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /order/
Disallow: /wishlist

Sitemap: ${SITE}/sitemap.xml
`)
console.log(`sitemap.xml: ${pages.length + productUrls.length} URLs for ${SITE}`)
