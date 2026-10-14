import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import { ArrowRight, Truck, ShieldCheck, Flame, Boxes, Hand, ShoppingBag, Building2, Phone, Factory, Warehouse, FileCheck, Hotel, UtensilsCrossed, Store, Landmark, Plane, BadgeCheck, Globe2, Award } from 'lucide-react'
import { useStore } from '../context/Store'
import { GROUPS, CATEGORIES, groupOf } from '../data/products'
import ProductCard from '../components/ProductCard'
import CatIcon from '../components/CatIcon'
import { Reveal } from '../components/Layout'
import { BRAND, inr } from '../lib/config'

const HERO_ART = ['wine-glasses', 'jugs', 'diyas', 'mugs-cups', 'vases']

export default function Home() {
  const { products } = useStore()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])

  // Featured: round-robin across groups so the home page shows the whole range
  const featured = useMemo(() => {
    const byGroup = {}
    products.filter((p) => p.featured).forEach((p) => (byGroup[groupOf(p.category)] ||= []).push(p))
    const lists = Object.values(byGroup); const out = []
    for (let i = 0; out.length < 8 && lists.some((l) => l[i]); i++) lists.forEach((l) => l[i] && out.length < 8 && out.push(l[i]))
    return out
  }, [products])
  const retailFrom = products.length ? Math.min(...products.map((p) => p.price)) : 0

  return (
    <>
      <section className="hero hero-general" ref={ref}>
        <div className="hero-glow" />
        <div className="container hero-grid">
          <div className="hero-content">
            <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Borosilicate glass manufacturer · since {BRAND.since}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>Handcrafted glass<br /><em>for every table.</em></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Kitchenware, bar & drinkware, crockery, temple items and décor — made by hand in our Delhi factory. Buy a single piece, or order wholesale and for export.</motion.p>
            <motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Link to="/shop" className="btn gold">Explore products <ArrowRight size={18} /></Link>
              <Link to="/corporate" className="btn ghost-l">Wholesale & export</Link>
            </motion.div>
          </div>
          <motion.div className="hero-art" style={{ y }}>
            {HERO_ART.map((k, i) => (
              <motion.img key={k} src={`/illustrations/${k}.svg`} alt="" className={`ha ha${i}`}
                initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
                transition={{ opacity: { delay: 0.3 + i * 0.12 }, scale: { delay: 0.3 + i * 0.12 }, y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 } }} />
            ))}
          </motion.div>
        </div>
        {[...Array(12)].map((_, i) => <span key={i} className="ember" style={{ left: `${(i * 8.3) % 100}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${7 + (i % 5)}s` }} />)}
      </section>

      <section className="usp container">
        {[[Flame, 'Heat-resistant', 'Borosilicate glass'], [Truck, 'Pan-India delivery', `Free above ${inr(BRAND.freeShippingAbove)}`], [ShieldCheck, 'Safe packing', 'Bubble-wrapped & boxed'], [Boxes, 'Wholesale & export', 'From 100 pcs']].map(([I, a, b], i) => (
          <Reveal key={a} delay={i * 0.08} className="usp-item"><I size={22} /><div><b>{a}</b><span>{b}</span></div></Reveal>
        ))}
      </section>

      <section className="container section story">
        <Reveal className="story-collage">
          {['modak-diya', 'crystal-bell', 'diya-combo-4', 'bell-diya-set'].map((k) => <img key={k} src={`/products/${k}.jpg`} alt="True Glass handcrafted borosilicate glass" loading="lazy" />)}
        </Reveal>
        <Reveal delay={0.1} className="story-text">
          <span className="eyebrow d">Our story</span>
          <h2>{BRAND.legal}</h2>
          <p>Since {BRAND.since} we have been making handcrafted borosilicate glass in Delhi — the clear, heat-resistant glass used for laboratory ware — for kitchens, bars, hotels, temples and homes.</p>
          <div className="story-points">
            <div><Award size={20} /><b>Commitment to quality</b><span>Every piece is shaped, finished and checked by hand.</span></div>
            <div><Globe2 size={20} /><b>India & export</b><span>Retail across India; bulk and export orders by bank transfer.</span></div>
          </div>
          <Link to="/about" className="btn dark">More about us</Link>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Browse</span><h2>Shop by category</h2></div><Link to="/shop" className="link">All products <ArrowRight size={16} /></Link></div></Reveal>
        <div className="groups">
          {GROUPS.map((g, i) => {
            const n = CATEGORIES.filter((c) => c.group === g.slug).length
            return (
              <Reveal key={g.slug} delay={i * 0.05}>
                <Link to={`/shop/${g.slug}`} className={'group-tile ' + (g.image ? 'has-img' : '')}>
                  {g.image && <img src={g.image} alt="" loading="lazy" />}
                  <span className="gt-icon"><CatIcon name={g.icon} size={26} /></span>
                  <b>{g.name}</b><span className="gt-sub">{g.blurb}</span>
                  <span className="gt-n">{n} {n === 1 ? 'category' : 'categories'} <ArrowRight size={14} /></span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Featured</span><h2>From our collection</h2></div><Link to="/shop" className="link">Shop all <ArrowRight size={16} /></Link></div></Reveal>
        <div className="grid">{featured.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Why choose us</span><h2>Made in our own factory, since {BRAND.since}</h2></div></div></Reveal>
        <div className="why">
          {[[Hand, 'Handcrafted', 'Every piece is shaped and finished by hand in borosilicate glass.'],
            [Factory, 'Own factory', 'Manufactured at our unit in SMA Industrial Area, GTK Road, Delhi.'],
            [Warehouse, 'Ready stock', 'Warehoused in Delhi for quick dispatch across India.'],
            [Boxes, 'Retail & wholesale', 'Single pieces online, tier pricing from 100 pcs.'],
            [Plane, 'Export orders', 'International bank transfer (SWIFT) for overseas buyers.'],
            [FileCheck, 'GST invoicing', `Registered company · GSTIN ${BRAND.gstin}.`]].map(([I, t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.08} className="why-item"><span><I size={22} /></span><div><b>{t}</b><p>{d}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="sale">
        <div className="container sale-inner">
          <Reveal>
            <span className="eyebrow">Two ways to buy</span>
            <h2>Retail for your home. Wholesale for your business.</h2>
            <p>Order single pieces online, or switch to wholesale pricing on any product that offers it — and request a quote for anything in our range.</p>
            <div className="choice">
              <Link to="/shop" className="choice-card"><ShoppingBag /><b>Retail</b><span>From {inr(retailFrom)} · no minimum</span></Link>
              <Link to="/corporate" className="choice-card gold"><Building2 /><b>Wholesale & export</b><span>100+ pcs · GST invoice · SWIFT</span></Link>
            </div>
          </Reveal>
          <motion.img src="/illustrations/gift-sets.svg" alt="" className="sale-img" whileInView={{ rotate: [-3, 2, -3] }} transition={{ duration: 6, repeat: Infinity }} />
        </div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Explore</span><h2>Everything we make</h2></div></div></Reveal>
        <div className="showcase">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 5) * 0.05}>
              <Link to={`/shop/${c.slug}`} className="sc-item"><img src={c.image} alt="" loading="lazy" /><span>{c.name}</span></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Who we serve</span><h2>From homes to hotels</h2></div></div></Reveal>
        <div className="serve">
          {[[Hotel, 'Hotels & banquets'], [UtensilsCrossed, 'Restaurants & bars'], [Store, 'Retailers & distributors'], [Building2, 'Corporate gifting'], [Landmark, 'Temples & pooja stores'], [ShoppingBag, 'Home buyers']].map(([I, t], i) => (
            <Reveal key={t} delay={i * 0.05} className="serve-item"><I size={26} strokeWidth={1.6} /><span>{t}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal className="export-band">
          <div className="eb-text">
            <span className="eyebrow">Global presence</span>
            <h2>Exporting handcrafted glass from Delhi</h2>
            <p>Send us your list of designs and quantities — we’ll share a formal quote with pricing, packing and lead time. Payments by international wire to our Punjab National Bank account (SWIFT {BRAND.bank.swift}).</p>
            <div className="hero-cta"><Link to="/corporate" className="btn gold">Request an export quote <ArrowRight size={18} /></Link><a href={`mailto:${BRAND.email}`} className="btn ghost-l">{BRAND.email}</a></div>
          </div>
          <div className="eb-badges">
            {[[BadgeCheck, 'GSTIN', BRAND.gstin], [FileCheck, 'CIN', BRAND.cin], [Globe2, 'SWIFT', BRAND.bank.swift]].map(([I, k, v]) => <div key={k}><I size={20} /><span>{k}</span><b>{v}</b></div>)}
          </div>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal className="call-band">
          <div><h2>Questions or a bulk order?</h2><p>Call or WhatsApp us — we’re happy to help you choose.</p></div>
          <div className="hero-cta">{BRAND.contacts.map((c, i) => <a key={c.phone} href={`tel:+91${c.phone}`} className={'btn ' + (i ? 'ghost-l' : 'gold')}><Phone size={18} /> {c.phone} · {c.name.replace('Mr. ', '')}</a>)}</div>
        </Reveal>
      </section>
    </>
  )
}