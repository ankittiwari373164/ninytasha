// Seed catalogue. Used when Supabase isn't configured, and mirrored in supabase/schema.sql.
// price  = retail price for one unit as sold (a single piece, or the whole combo)
// tiers  = wholesale rates from the posters: [{ min, price, carton }], priced per wholesale_unit
const img = (f) => `/products/${f}`
const art = (k) => `/illustrations/${k}.svg`

// Category groups → categories. Products use the category slug.
// A category with no products yet shows an "ask for catalogue" panel instead of an empty grid.
export const GROUPS = [
  { slug: 'temple', name: 'Temple & Pooja', icon: 'Flame', blurb: 'Diyas, akhand jyot, temple bells', image: img('modak-diya.jpg') },
  { slug: 'kitchen', name: 'Kitchenware', icon: 'Coffee', blurb: 'Mugs, cups, jars, bottles, jugs', image: art('jugs') },
  { slug: 'barware', name: 'Bar & Drinkware', icon: 'Wine', blurb: 'Wine, cocktail & champagne glasses, tumblers', image: art('wine-glasses') },
  { slug: 'crockery', name: 'Crockery', icon: 'Soup', blurb: 'Bowls, plates, dessert cups', image: art('crockery') },
  { slug: 'decor', name: 'Handicraft & Décor', icon: 'Flower2', blurb: 'Candle stands, holders, jars, vases', image: art('vases') },
  { slug: 'gifting', name: 'Gift Sets', icon: 'Gift', blurb: 'Festive & corporate combos', image: img('trio-set.jpg') },
]

export const CATEGORIES = [
  { slug: 'diyas', group: 'temple', name: 'Glass Diyas', image: img('modak-diya.jpg'), blurb: 'Modak & fluted oil lamps' },
  { slug: 'akhand-jyot', group: 'temple', name: 'Akhand Jyot', image: art('akhand-jyot'), blurb: 'Tall & table pooja lamps' },
  { slug: 'bells', group: 'temple', name: 'Temple Bells', image: img('crystal-bell.jpg'), blurb: 'Hand-finished glass bells' },
  { slug: 'mugs-cups', group: 'kitchen', name: 'Mugs & Cups', image: art('mugs-cups'), blurb: 'Tea, coffee & double-wall' },
  { slug: 'jars', group: 'kitchen', name: 'Storage Jars', image: art('jars'), blurb: 'Kitchen & pantry jars' },
  { slug: 'water-bottles', group: 'kitchen', name: 'Water Bottles', image: art('water-bottles'), blurb: 'Borosilicate bottles' },
  { slug: 'jugs', group: 'kitchen', name: 'Jugs & Carafes', image: art('jugs'), blurb: 'Serving jugs & decanters' },
  { slug: 'wine-glasses', group: 'barware', name: 'Wine Glasses', image: art('wine-glasses'), blurb: 'Stemware for red & white' },
  { slug: 'cocktail-glasses', group: 'barware', name: 'Cocktail Glasses', image: art('cocktail-glasses'), blurb: 'Coupes, martini & novelty' },
  { slug: 'champagne-glasses', group: 'barware', name: 'Champagne Glasses', image: art('champagne-glasses'), blurb: 'Flutes & tulips' },
  { slug: 'tumblers', group: 'barware', name: 'Tumblers', image: art('tumblers'), blurb: 'Everyday drinking glasses' },
  { slug: 'crockery', group: 'crockery', name: 'Bowls & Dessert Cups', image: art('crockery'), blurb: 'Serveware & crockery' },
  { slug: 'candle-stands', group: 'decor', name: 'Candle Stands & Holders', image: art('candle-stands'), blurb: 'Tealight & pillar holders' },
  { slug: 'vases', group: 'decor', name: 'Vases & Décor Jars', image: art('vases'), blurb: 'Flower vases & zars' },
  { slug: 'gift-sets', group: 'gifting', name: 'Gift Sets', image: img('trio-set.jpg'), blurb: 'Combos for festive gifting' },
]

export const groupOf = (catSlug) => CATEGORIES.find((c) => c.slug === catSlug)?.group
export const catsInGroup = (groupSlug) => CATEGORIES.filter((c) => c.group === groupSlug)

export const COLOR_HEX = { Blue: '#1f5fbf', Orange: '#f08a1c', Pink: '#ee8fb5', Green: '#1f7a4c', Clear: '#f4f4f2', Amber: '#b8621b' }

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
// ---- Glassware (illustration shown until a product photo is uploaded in admin) ----
  P({
    id: 'nt-cg01', sku: 'NT-CG01', name: 'Fish Cocktail Glass — Blue', category: 'cocktail-glasses',
    price: 350, pack: 1, size: '320 ml', colors: ['Blue'], featured: true,
    images: [art('cocktail-glasses')],
    description: 'A playful handcrafted cocktail glass with a fish-shaped bowl in blue borosilicate glass, finished with clear fins on a slender stem. A conversation piece for bars, restaurants and home entertaining.',
  }),
  P({
    id: 'nt-tu01', sku: 'NT-TU01', name: 'Clear Glass Tumbler', category: 'tumblers',
    price: 140, pack: 1, size: '380 ml', colors: ['Clear'], featured: true,
    images: [art('tumblers')],
    description: 'An everyday tapered tumbler in crystal-clear borosilicate glass — light, strong and safe for hot or cold drinks. Ideal for water, juice and iced beverages.',
  }),
  P({
    id: 'nt-wg01', sku: 'NT-WG01', name: 'Tulip Wine Glass', category: 'wine-glasses',
    price: 175, pack: 1, size: '200 ml', colors: ['Clear'], featured: true,
    images: [art('wine-glasses')],
    description: 'A tall tulip-shaped wine glass with a gently flared rim and a fine knop on the stem, hand-finished in borosilicate glass.',
  }),
  P({
    id: 'nt-dc01', sku: 'NT-DC01', name: 'Amber Dessert Cup', category: 'crockery',
    price: 262, pack: 1, size: '220 ml', colors: ['Amber'], featured: true,
    images: [art('crockery')],
    description: 'A wide clear glass bowl on a solid amber pedestal — for desserts, sundaes, mousse and fruit. Part of our Amber collection.',
  }),
  P({
    id: 'nt-ch01', sku: 'NT-CH01', name: 'Champagne Flute', category: 'champagne-glasses',
    price: 159, pack: 1, size: '220 ml', colors: ['Clear'], featured: true,
    images: [art('champagne-glasses')],
    description: 'A slim, straight-sided champagne flute on a long stem that keeps the bubbles lively. Clear borosilicate glass, hand-finished.',
  }),
  P({
    id: 'nt-jg01', sku: 'NT-JG01', name: 'Ribbed Glass Jug', category: 'jugs',
    price: 229, pack: 1, size: '1000 ml', colors: ['Clear'], featured: true,
    images: [art('jugs')],
    description: 'A 1-litre carafe-style jug with an hourglass waist and fluted ribs. Heat-resistant borosilicate glass for water, juices and iced tea.',
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

export const isIllustration = (src = '') => src.startsWith('/illustrations/')