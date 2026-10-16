import { useEffect } from 'react'
import { BRAND } from './config'

// Public site URL — set VITE_SITE_URL in Vercel when you add a custom domain
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ninytashaexportspvtltd.vercel.app').replace(/\/$/, '')
const DEFAULT_IMAGE = '/products/trio-set.jpg'
const DEFAULT_DESC = `${BRAND.legal} — manufacturer of handcrafted borosilicate glassware since ${BRAND.since}: kitchenware, wine & cocktail glasses, crockery, diyas, temple bells and décor. Retail, wholesale & export from Delhi.`

const abs = (u) => (u?.startsWith('http') ? u : SITE_URL + (u || ''))

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
  el.setAttribute('href', href)
}

/**
 * Per-page SEO: title, description, canonical, Open Graph / Twitter, robots and JSON-LD.
 * useSeo({ title, description, path, image, type, noindex, jsonLd })
 */
export function useSeo({ title, description = DEFAULT_DESC, path, image = DEFAULT_IMAGE, type = 'website', noindex = false, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BRAND.name}` : `${BRAND.name} — Handcrafted Borosilicate Glassware Manufacturer`
    const url = SITE_URL + (path ?? window.location.pathname)
    document.title = fullTitle
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setLink('canonical', url)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', abs(image))
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', abs(image))

    let s = document.getElementById('page-jsonld')
    if (ld) {
      if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'page-jsonld'; document.head.appendChild(s) }
      s.textContent = ld
    } else if (s) s.remove()
  }, [title, description, path, image, type, noindex, ld])
}

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE_URL + path })),
})

export const productLd = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  sku: p.sku,
  description: p.description,
  image: (p.images || []).map(abs),
  brand: { '@type': 'Brand', name: BRAND.productBrand },
  manufacturer: { '@type': 'Organization', name: BRAND.legal },
  material: 'Borosilicate glass',
  ...(p.size ? { size: p.size } : {}),
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/product/${p.id}`,
    priceCurrency: 'INR',
    price: String(p.price),
    availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: BRAND.legal },
  },
})