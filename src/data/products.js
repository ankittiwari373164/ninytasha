// Seed catalogue. Used as fallback when Supabase isn't configured,
// and mirrored in supabase/schema.sql seed inserts.
const img = (f) => `/products/${f}`
const modakDesc = 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.'
const jyotDesc = 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed amber base. A traditional oil lamp for pooja, Diwali, mandir and festive home décor — and a thoughtful spiritual gift.'
const tiers = (a, b, c) => [{ min: 100, price: a }, { min: 500, price: b }, { min: 1000, price: c }]

export const CATEGORIES = [
  { slug: 'modak-diyas', name: 'Modak Diyas', image: img('kw01.jpg'), blurb: 'Ribbed glass oil lamps' },
  { slug: 'akhand-jyot', name: 'Akhand Jyot', image: img('kw13.jpg'), blurb: 'Tall & table pooja lamps' },
  { slug: 'bells', name: 'Temple Bells', image: img('r3_002.jpg'), blurb: 'Glass bells with Om motif' },
  { slug: 'gift-sets', name: 'Gift Sets', image: img('r3_007.jpg'), blurb: 'Boxed combos for gifting' },
  { slug: 'corporate', name: 'Corporate Bulk', image: img('r3_003.jpg'), blurb: 'Tier pricing from 100 pcs' },
]

const P = (o) => ({ stock: 200, rating: 4.7, reviews: 18, active: true, featured: false, min_qty: 1, tiers: null, colors: [], ...o })

export const PRODUCTS = [
  P({ id: 'kw-50', sku: 'KW-50', name: 'Modak Glass Oil Diya — Clear', category: 'modak-diyas', price: 149, mrp: 249, pack: 1, images: [img('kw01.jpg')], description: modakDesc, colors: ['Clear'], featured: true, rating: 4.8, reviews: 42 }),
  P({ id: 'kw-51', sku: 'KW-51', name: 'Modak Glass Oil Diya — Pack of 2', category: 'modak-diyas', price: 249, mrp: 449, pack: 2, images: [img('kw02.jpg')], description: modakDesc, colors: ['Clear'] }),
  P({ id: 'kw-52', sku: 'KW-52', name: 'Modak Glass Oil Diya — Pack of 4', category: 'modak-diyas', price: 499, mrp: 899, pack: 4, images: [img('kw03.jpg')], description: modakDesc, colors: ['Clear'], featured: true }),
  P({ id: 'kw-53', sku: 'KW-53', name: 'Modak Glass Oil Diya — Pack of 6', category: 'modak-diyas', price: 650, mrp: 1299, pack: 6, images: [img('kw04.jpg')], description: modakDesc, colors: ['Clear'] }),
  P({ id: 'kw-54', sku: 'KW-54', name: 'Coloured Modak Diya — Single', category: 'modak-diyas', price: 165, mrp: 299, pack: 1, images: [img('kw05.jpg')], description: modakDesc, colors: ['Blue', 'Red', 'Yellow', 'Clear'], rating: 4.9, reviews: 31 }),
  P({ id: 'kw-55', sku: 'KW-55', name: 'Coloured Modak Diya — Pack of 2', category: 'modak-diyas', price: 299, mrp: 549, pack: 2, images: [img('kw06.jpg')], description: modakDesc, colors: ['Assorted'] }),
  P({ id: 'kw-56', sku: 'KW-56', name: 'Coloured Modak Diya — Pack of 4', category: 'modak-diyas', price: 599, mrp: 1099, pack: 4, images: [img('kw07.jpg')], description: modakDesc, colors: ['Assorted'], featured: true, rating: 4.9, reviews: 57 }),
  P({ id: 'kw-57', sku: 'KW-57', name: 'Coloured Modak Diya — Pack of 6', category: 'modak-diyas', price: 699, mrp: 1499, pack: 6, images: [img('kw08.jpg')], description: modakDesc, colors: ['Assorted'] }),
  P({ id: 'kw-58', sku: 'KW-58', name: 'Tall Akhand Jyot Aarti Diya', category: 'akhand-jyot', price: 599, mrp: 999, pack: 1, images: [img('kw09.jpg')], description: 'A tall borosilicate aarti diya with a multi-wick bowl over a tiered glass stem. ' + jyotDesc, colors: ['6 assorted colours'], featured: true }),
  P({ id: 'kw-59', sku: 'KW-59', name: 'Akhand Jyot, Small Jyot & Bell — 3-pc Set', category: 'gift-sets', price: 1499, mrp: 2299, pack: 3, images: [img('kw10.jpg')], description: 'Three-piece pooja gift set: tall akhand jyot, small akhand jyot and a glass temple bell. Available in six assorted colours.', colors: ['6 assorted colours'] }),
  P({ id: 'kw-60', sku: 'KW-60', name: 'Akhand Jyot 3-pc Gift Set with Box', category: 'gift-sets', price: 1699, mrp: 2599, pack: 3, images: [img('kw11.jpg')], description: 'The three-piece akhand jyot and bell set, presented in a premium rigid gift box — ready to hand over.', colors: ['6 assorted colours'], featured: true }),
  P({ id: 'kw-61', sku: 'KW-61', name: 'Small Akhand Jyot — Single', category: 'akhand-jyot', price: 299, mrp: 499, pack: 1, images: [img('kw12.jpg')], description: jyotDesc, colors: ['6 assorted colours'] }),
  P({ id: 'kw-62', sku: 'KW-62', name: 'Small Akhand Jyot — Pack of 2', category: 'akhand-jyot', price: 349, mrp: 699, pack: 2, images: [img('kw13.jpg')], description: jyotDesc, colors: ['6 assorted colours'], rating: 4.8, reviews: 26 }),
  P({ id: 'kw-63', sku: 'KW-63', name: 'Small Akhand Jyot — Pack of 4', category: 'akhand-jyot', price: 799, mrp: 1299, pack: 4, images: [img('kw14.jpg')], description: jyotDesc, colors: ['6 assorted colours'] }),
  P({ id: 'kw-64', sku: 'KW-64', name: 'Glass Temple Bell with Om', category: 'bells', price: 220, mrp: 399, pack: 1, images: [img('kw15.jpg')], description: 'Handcrafted decorative pooja bell in clear glass with a gold Om motif, twisted stem and ruby finial.', colors: ['Amber'] }),
  // Corporate / bulk range (min 100 pcs, tier pricing)
  P({ id: 'r3b01', sku: 'R3B01', name: 'Crystal Bell (Bulk)', category: 'corporate', price: 105, mrp: 199, pack: 1, min_qty: 100, tiers: tiers(105, 95, 85), images: [img('r3_002.jpg')], description: 'A hand-finished borosilicate glass bell with a hexagonal base and jewel-toned finial. 5 inch. Ideal for corporate Diwali gifting.', colors: ['Blue', 'Orange', 'Pink', 'Green'], featured: true }),
  P({ id: 'r3d01', sku: 'R3D01', name: 'Fluted Diya Oil Lamp & Tealight (Bulk)', category: 'corporate', price: 105, mrp: 199, pack: 1, min_qty: 100, tiers: tiers(105, 95, 85), images: [img('r3_003.jpg')], description: 'A 3 inch fluted glass diya that works with oil or a tealight; its ridged base catches the glow of the flame.', colors: ['Blue', 'Orange', 'Pink', 'Green'] }),
  P({ id: 'r3md01', sku: 'R3MD01', name: 'Modak Diya Oil Lamp (Bulk)', category: 'corporate', price: 105, mrp: 199, pack: 1, min_qty: 100, tiers: tiers(105, 95, 85), images: [img('r3_004.jpg')], description: '4 inch modak-shaped ribbed vessel that doubles as an oil lamp — a distinctive alternative to the classic diya.', colors: ['Clear'] }),
  P({ id: 'r3bd01', sku: 'R3BD01', name: 'Bell & Diya Gift Set (Bulk)', category: 'corporate', price: 190, mrp: 349, pack: 2, min_qty: 100, tiers: tiers(190, 155, 140), images: [img('r3_005.jpg')], description: 'Crystal Bell (5") paired with the fluted Diya (3"), gift-boxed as one set.', colors: ['Blue', 'Orange', 'Pink', 'Green'] }),
  P({ id: 'r3bmd01', sku: 'R3BMD01', name: 'Bell & Modak Diya Gift Set (Bulk)', category: 'corporate', price: 190, mrp: 349, pack: 2, min_qty: 100, tiers: tiers(190, 155, 140), images: [img('r3_006.jpg')], description: 'Crystal Bell (5") with the clear Modak Diya (4") — two signature silhouettes in one gift set.', colors: ['Bell: 4 colours', 'Modak: Clear'] }),
  P({ id: 'r3com01', sku: 'R3COM01', name: 'Bell, Modak Diya & Diya Trio (Bulk)', category: 'corporate', price: 290, mrp: 549, pack: 3, min_qty: 100, tiers: tiers(290, 270, 250), images: [img('r3_007.jpg')], description: 'The flagship premium client gift: bell, fluted diya and modak diya together in one set.', colors: ['Bell: 4 colours', 'Modak: Clear'], featured: true }),
]

export const unitPrice = (p, qty) => {
  if (!p.tiers?.length) return p.price
  return [...p.tiers].sort((a, b) => b.min - a.min).find((t) => qty >= t.min)?.price ?? p.tiers[0].price
}
