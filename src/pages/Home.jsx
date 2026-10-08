import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ArrowRight, Truck, ShieldCheck, Flame, Gift, Star, Sparkles } from 'lucide-react'
import { useStore } from '../context/Store'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'
import { Reveal } from '../components/Layout'

function Countdown() {
  // Next Diwali-season sale end; editable
  const end = new Date('2026-11-08T23:59:59+05:30').getTime()
  const [t, setT] = useState(end - Date.now())
  useEffect(() => { const i = setInterval(() => setT(end - Date.now()), 1000); return () => clearInterval(i) }, [end])
  if (t <= 0) return null
  const d = Math.floor(t / 864e5), h = Math.floor(t / 36e5) % 24, m = Math.floor(t / 6e4) % 60, s = Math.floor(t / 1e3) % 60
  return <div className="countdown">{[[d, 'Days'], [h, 'Hrs'], [m, 'Min'], [s, 'Sec']].map(([v, l]) => <div key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>)}</div>
}

export default function Home() {
  const { products } = useStore()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const featured = products.filter((p) => p.featured && !p.tiers).slice(0, 8)
  const bulk = products.filter((p) => p.tiers).slice(0, 4)

  return (
    <>
      <section className="hero" ref={ref}>
        <motion.div className="hero-bg" style={{ y, backgroundImage: 'url(/products/r3_001.jpg)' }} />
        <div className="hero-glow" />
        <div className="container hero-content">
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Hand-finished borosilicate glass</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>Light that<br /><em>glows twice.</em></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Modak diyas, akhand jyots and temple bells crafted in clear and jewel-toned glass — the flame refracts through every ridge.</motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Link to="/shop" className="btn gold">Shop the collection <ArrowRight size={18} /></Link>
            <Link to="/corporate" className="btn ghost-l">Corporate gifting</Link>
          </motion.div>
        </div>
        {[...Array(14)].map((_, i) => <span key={i} className="ember" style={{ left: `${(i * 7.3) % 100}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${6 + (i % 5)}s` }} />)}
      </section>

      <section className="usp container">
        {[[Flame, 'Heat-resistant', 'Borosilicate glass'], [Truck, 'Free shipping', 'Above ₹999'], [ShieldCheck, 'Safe packing', 'Breakage covered'], [Gift, 'Gift ready', 'Premium boxes']].map(([I, a, b], i) => (
          <Reveal key={a} delay={i * 0.08} className="usp-item"><I size={22} /><div><b>{a}</b><span>{b}</span></div></Reveal>
        ))}
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Browse</span><h2>Shop by category</h2></div><Link to="/shop" className="link">View all <ArrowRight size={16} /></Link></div></Reveal>
        <div className="cats">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Link to={`/shop/${c.slug}`} className="cat">
                <img src={c.image} alt={c.name} loading="lazy" />
                <div><b>{c.name}</b><span>{c.blurb}</span></div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Bestsellers</span><h2>Loved this festive season</h2></div><Link to="/shop" className="link">Shop all <ArrowRight size={16} /></Link></div></Reveal>
        <div className="grid">{featured.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>

      <section className="sale">
        <div className="container sale-inner">
          <Reveal>
            <span className="eyebrow">Festival of Lights Sale</span>
            <h2>Up to 50% off on diya packs</h2>
            <p>Use code <b>DIWALI10</b> for an extra 10% off orders above ₹499.</p>
            <Countdown />
            <Link to="/shop/modak-diyas" className="btn gold">Grab the deal <ArrowRight size={18} /></Link>
          </Reveal>
          <motion.img src="/products/kw07.jpg" alt="" className="sale-img" whileInView={{ rotate: [-4, 2, -4] }} transition={{ duration: 6, repeat: Infinity }} />
        </div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">For businesses</span><h2>Corporate & bulk gifting</h2></div><Link to="/corporate" className="link">Get a quote <ArrowRight size={16} /></Link></div></Reveal>
        <div className="grid">{bulk.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>

      <section className="container section story">
        <Reveal className="story-img"><img src="/products/r3_006.jpg" alt="Glass bell and modak diya" /></Reveal>
        <Reveal delay={0.1} className="story-text">
          <span className="eyebrow d">Our craft</span>
          <h2>Blown, shaped and finished by hand</h2>
          <p>Every diya begins as a rod of borosilicate glass — the same heat-resistant material used in laboratory glassware. Our artisans flame-work each piece, pulling the ribs of the modak and twisting the stem of every bell by hand.</p>
          <ul className="ticks"><li><Sparkles size={16} /> Withstands the heat of a burning wick</li><li><Sparkles size={16} /> Washable and reusable for years</li><li><Sparkles size={16} /> Lead-free, food-safe glass</li></ul>
          <Link to="/about" className="btn dark">Read our story</Link>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Reviews</span><h2>What our customers say</h2></div></div></Reveal>
        <div className="testis">
          {[['Ananya, Pune', 'The coloured modak diyas look magical once lit. Packed so well — not a single scratch.'], ['Rohit, Gurugram', 'Ordered 300 trio sets for our client Diwali gifts. On time, beautifully boxed, great tier pricing.'], ['Meera, Bengaluru', 'The tall akhand jyot is now the centrepiece of our mandir. Oil lasts the whole evening.']].map(([n, t], i) => (
            <Reveal key={n} delay={i * 0.1} className="testi"><div className="stars">{[...Array(5)].map((_, k) => <Star key={k} size={15} fill="currentColor" />)}</div><p>“{t}”</p><b>{n}</b></Reveal>
          ))}
        </div>
      </section>

      <section className="container section insta">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">@r3exports</span><h2>Lit up in your homes</h2></div></div></Reveal>
        <div className="insta-grid">{['kw13.jpg', 'r3_003.jpg', 'kw06.jpg', 'r3_002.jpg', 'kw14.jpg', 'kw11.jpg'].map((f, i) => <motion.img whileHover={{ scale: 1.04 }} key={f} src={`/products/${f}`} alt="" loading="lazy" style={{ transitionDelay: i * 40 + 'ms' }} />)}</div>
      </section>
    </>
  )
}
