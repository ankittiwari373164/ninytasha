// Seed catalogue. Used when Supabase isn't configured, and mirrored in supabase/schema.sql.
// price  = retail price for one unit as sold (a single piece, or the whole combo)
// tiers  = wholesale rates from the posters: [{ min, price, carton }], priced per wholesale_unit
const img = (f) => `/products/${f}`

export const CATEGORIES = [
  { slug: 'diyas', name: 'Glass Diyas', image: img('modak-diya.jpg'), blurb: 'Modak & fluted oil lamps' },
  { slug: 'bells', name: 'Crystal Bells', image: img('crystal-bell.jpg'), blurb: 'Hand-finished pooja bells' },
  { slug: 'gift-sets', name: 'Gift Sets', image: img('trio-set.jpg'), blurb: 'Combos for festive gifting' },
]

export const COLOR_HEX = { Blue: '#1f5fbf', Orange: '#f08a1c', Pink: '#ee8fb5', Green: '#1f7a4c', Clear: '#f4f4f2' }

const P = (o) => ({ stock: 500, rating: 0, reviews: 0, active: true, featured: true, mrp: 0, min_qty: 1, wholesale_unit: 'piece', color_note: null, ...o })
const T = (a, b, c, cartons = []) => [{ min: 100, price: a, carton: cartons[0] ?? null }, { min: 500, price: b, carton: cartons[1] ?? null }, { min: 1000, price: c, carton: cartons[2] ?? null }]

export const PRODUCTS = [
  P({
    id: 'kw-50', sku: 'KW-50', name: 'Modak Diya Oil Lamp & Tealight', category: 'diyas',
    price: 149, pack: 1, size: '4 inch', colors: ['Clear'],
    tiers: T(105, 95, 85),
    images: [img('modak-diya.jpg'), img('modak-diya-poster.jpg')],
    description: 'A distinctive ribbed glass diya inspired by the traditional Modak form, designed for oil or tealight use. Hand-finished in premium borosilicate glass — the ribs catch and multiply the glow of the flame.',
  }),
  P({
    id: 'kw-65', sku: 'KW-65', name: 'Bell & Diya Set', category: 'gift-sets',
    price: 349, pack: 2, size: 'Bell 5" + Diya 3"', colors: ['Blue', 'Orange', 'Pink', 'Green'],
    tiers: T(190, 155, 140), wholesale_unit: 'set',
    images: [img('bell-diya-set.jpg'), img('bell-diya-set-poster.jpg')],
    description: 'A handcrafted Crystal Bell paired with a fluted glass Diya — an elegant festive gifting combination. Perfect for Diwali, pooja and client gifting.',
  }),
  P({
    id: 'kw-64', sku: 'KW-64', name: 'Crystal Bell', category: 'bells',
    price: 199, pack: 1, size: '5 inch', colors: ['Blue', 'Orange', 'Pink', 'Green'],
    tiers: T(105, 95, 85, [12, 12, 4]),
    images: [img('crystal-bell.jpg'), img('crystal-bell-poster.jpg')],
    description: 'A hand-finished borosilicate glass bell with a hexagonal base, Om motif and a jewel-toned finial. Available in four colourways.',
  }),
  P({
    id: 'kw-64-4', sku: 'KW-64-4', name: 'Diya Oil Lamp & Tealight — Combo of 4', category: 'diyas',
    price: 799, pack: 4, size: '3 inch', colors: ['Blue', 'Orange', 'Pink', 'Green'], color_note: 'Combo includes one of each colour',
    tiers: T(105, 95, 85, [12, 12, 4]),
    images: [img('diya-combo-4.jpg'), img('diya-combo-4-poster.jpg')],
    description: 'A fluted glass diya that works equally well with oil or a tealight, its ridged base catching the flame’s glow. This combo brings all four colours together.',
  }),
  P({
    id: 'kw-66', sku: 'KW-66', name: 'Bell, Modak Diya & Diya Trio', category: 'gift-sets',
    price: 1499, pack: 3, size: 'Bell 5" + Diya 3" + Modak Diya 4"', colors: ['Blue', 'Orange', 'Pink', 'Green'], color_note: 'Colour applies to the bell · Modak Diya is clear',
    tiers: T(290, 270, 250), wholesale_unit: 'set',
    images: [img('trio-set.jpg'), img('trio-set-poster.jpg')],
    description: 'The full collection in one set — bell, diya and modak diya together. The flagship option for premium festive and client gifting.',
  }),
]

export const minQty = (p, mode = 'retail') => (mode === 'wholesale' && p.tiers?.length ? p.tiers[0].min : 1)

export const unitPrice = (p, qty, mode = 'retail') => {
  if (mode !== 'wholesale' || !p.tiers?.length) return Number(p.price)
  const t = [...p.tiers].sort((a, b) => b.min - a.min).find((t) => qty >= t.min)
  return Number(t?.price ?? p.tiers[0].price)
}

export const unitLabel = (p, mode = 'retail') =>
  mode === 'wholesale' ? (p.wholesale_unit === 'set' ? 'set' : 'pc') : p.pack > 1 ? `combo of ${p.pack}` : 'pc'
