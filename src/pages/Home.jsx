import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Truck, ShieldCheck, Flame, Boxes, Gem, Sparkles, Hand, ShoppingBag, Building2, Phone, Factory, Warehouse, FileCheck, Hotel, UtensilsCrossed, Store, Landmark, Plane, BadgeCheck } from 'lucide-react'
import { useStore } from '../context/Store'
import { GROUPS, CATEGORIES, unitLabel } from '../data/products'
import CatIcon from '../components/CatIcon'
import ProductCard from '../components/ProductCard'
import { Reveal } from '../components/Layout'
import { BRAND, inr } from '../lib/config'

export default function Home() {
  const { products } = useStore()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const retailFrom = products.length ? Math.min(...products.map((p) => p.price)) : 0
  const wsFrom = products.filter((p) => p.tiers).length ? Math.min(...products.flatMap((p) => (p.tiers || []).map((t) => t.price))) : 0

  return (
    <>
      <section className="hero" ref={ref}>
        <motion.div className="hero-bg" style={{ y, backgroundImage: 'url(/products/trio-set.jpg)' }} />
        <div className="hero-glow" />
        <div className="container hero-content">
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{BRAND.productBrand} · Borosilicate</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>Light that<br /><em>glows twice.</em></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Handcrafted borosilicate glass from our Delhi factory: temple diyas and bells, kitchenware, barware, crockery and décor. Buy a single piece, or order wholesale and for export.</motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Link to="/shop" className="btn gold">Shop the collection <ArrowRight size={18} /></Link>
            <Link to="/corporate" className="btn ghost-l">Wholesale & gifting</Link>
          </motion.div>
        </div>
        {[...Array(14)].map((_, i) => <span key={i} className="ember" style={{ left: `${(i * 7.3) % 100}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${6 + (i % 5)}s` }} />)}
      </section>

      <section className="usp container">
        {[[Flame, 'Heat-resistant', 'Borosilicate glass'], [Truck, 'Free shipping', `Above ${inr(BRAND.freeShippingAbove)}`], [ShieldCheck, 'Safe packing', 'Bubble-wrapped & boxed'], [Boxes, 'Wholesale', 'From 100 pcs']].map(([I, a, b], i) => (
          <Reveal key={a} delay={i * 0.08} className="usp-item"><I size={22} /><div><b>{a}</b><span>{b}</span></div></Reveal>
        ))}
      </section>

      <section className="container section">
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Browse</span><h2>Shop by category</h2></div><Link to="/shop" className="link">View all <ArrowRight size={16} /></Link></div></Reveal>
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
        <Reveal><div className="sec-head"><div><span className="eyebrow d">The collection</span><h2>Handcrafted for festive light</h2></div><Link to="/shop" className="link">Shop all <ArrowRight size={16} /></Link></div></Reveal>
        <div className="grid">{products.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>

      <section className="sale">
        <div className="container sale-inner">
          <Reveal>
            <span className="eyebrow">Two ways to buy</span>
            <h2>Retail for your home. Wholesale for your business.</h2>
            <p>Every product page lets you switch between retail and wholesale pricing — pick what fits your order.</p>
            <div className="choice">
              <Link to="/shop" className="choice-card"><ShoppingBag /><b>Retail</b><span>From {inr(retailFrom)} · no minimum</span></Link>
              <Link to="/corporate" className="choice-card gold"><Building2 /><b>Wholesale</b><span>From {inr(wsFrom)}/pc · 100+ pcs</span></Link>
            </div>
          </Reveal>
          <motion.img src="/products/diya-combo-4.jpg" alt="" className="sale-img" whileInView={{ rotate: [-3, 2, -3] }} transition={{ duration: 6, repeat: Infinity }} />
        </div>
      </section>

      <section className="container section story">
        <Reveal className="story-img"><img src="/products/bell-diya-set.jpg" alt="Crystal bell and diya set" /></Reveal>
        <Reveal delay={0.1} className="story-text">
          <span className="eyebrow d">Our story</span>
          <h2>{BRAND.legal}</h2>
          <p>Since {BRAND.since} we have been making handcrafted borosilicate glass in Delhi — the heat-resistant glass used for laboratory ware — for kitchens, bars, temples and homes. Our {BRAND.productBrand} range covers everything from diyas and temple bells to mugs, jars, wine glasses and vases.</p>
          <ul className="ticks"><li><BadgeCheck size={16} /> Heat & thermal-shock resistant</li><li><BadgeCheck size={16} /> Crystal clear, lead-free glass</li><li><BadgeCheck size={16} /> Retail, wholesale & export</li></ul>
          <Link to="/about" className="btn dark">About us</Link>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Why choose us</span><h2>Made in our own factory, since {BRAND.since}</h2></div></div></Reveal>
        <div className="why">
          {[[Hand, 'Handcrafted', 'Every piece is shaped and finished by hand in borosilicate glass.'],
            [Factory, 'Own factory', 'Manufactured at our unit in SMA Industrial Area, GTK Road, Delhi.'],
            [Warehouse, 'Ready stock', 'Warehoused in Delhi for quick dispatch across India.'],
            [Boxes, 'Retail & wholesale', 'Single pieces online, tier pricing from 100 pcs.'],
            [Plane, 'Export orders', 'Bank transfer & SWIFT payments for international buyers.'],
            [FileCheck, 'GST invoicing', `Registered company · GSTIN ${BRAND.gstin}.`]].map(([I, t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.08} className="why-item"><span><I size={22} /></span><div><b>{t}</b><p>{d}</p></div></Reveal>
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
        <Reveal><div className="sec-head"><div><span className="eyebrow d">Lookbook</span><h2>The catalogue</h2></div></div></Reveal>
        <div className="lookbook">
          {products.map((p, i) => p.images[1] && (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <Link to={`/product/${p.id}`} className="lb-item"><img src={p.images[1]} alt={p.name} loading="lazy" /><span>{p.name} · {inr(p.price)}/{unitLabel(p)}</span></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal className="call-band">
          <div><h2>Questions or a bulk order?</h2><p>Call or WhatsApp us — we’re happy to help you choose.</p></div>
          <div className="hero-cta"><a href={`tel:+91${BRAND.phone}`} className="btn gold"><Phone size={18} /> {BRAND.phone}</a><a href={`tel:+91${BRAND.phone2}`} className="btn ghost-l"><Phone size={18} /> {BRAND.phone2}</a></div>
        </Reveal>
      </section>
    </>
  )
}