import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, Phone, MapPin, MessageCircle, Search, Flame, Hand, Leaf } from 'lucide-react'
import { useStore } from '../context/Store'
import { BRAND, inr } from '../lib/config'
import * as api from '../lib/api'
import { Reveal } from '../components/Layout'

export function About() {
  return (
    <div className="page">
      <section className="bulk-hero about"><div className="container"><Reveal><span className="eyebrow">Our story</span><h1>Glass, fire and a festival of light</h1><p>We started with a single modak diya and a question: what if the lamp itself could glow?</p></Reveal></div></section>
      <section className="container section story">
        <Reveal className="story-img"><img src="/products/r3_004.jpg" alt="" /></Reveal>
        <Reveal className="story-text" delay={0.1}>
          <h2>Made by hand, in India</h2>
          <p>{BRAND.name} works with family workshops of flame-workers who have shaped borosilicate glass for decades. Each diya, jyot and bell is formed over a torch, annealed for strength and inspected by hand before it is packed.</p>
          <p>We serve households celebrating at home and companies sending thousands of client gifts — with the same care for every order.</p>
        </Reveal>
      </section>
      <section className="container section"><div className="values">
        {[[Hand, 'Handcrafted', 'No two pieces are identical — tiny variations are the maker’s mark.'], [Flame, 'Built for flame', 'Borosilicate glass handles heat far better than ordinary glass.'], [Leaf, 'Made to last', 'Reusable for years — a lasting swap for disposable diyas.']].map(([I, t, d], i) => (
          <Reveal key={t} delay={i * 0.1} className="value"><I size={28} /><h3>{t}</h3><p>{d}</p></Reveal>
        ))}
      </div></section>
      <section className="container section stats">{[['50k+', 'Diyas lit'], ['300+', 'Corporate clients'], ['4.8★', 'Average rating'], ['28', 'States delivered']].map(([n, l], i) => <Reveal key={l} delay={i * 0.08}><b>{n}</b><span>{l}</span></Reveal>)}</section>
    </div>
  )
}

export function Contact() {
  const { toast } = useStore()
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' })
  const submit = async (e) => { e.preventDefault(); await api.createEnquiry({ type: 'contact', ...f }); toast('Message sent — we’ll reply soon'); setF({ name: '', email: '', phone: '', message: '' }) }
  return (
    <div className="container page">
      <h1>Contact us</h1><p className="muted">Questions about an order, a custom design or bulk pricing? We usually reply within a few hours.</p>
      <div className="contact">
        <div className="contact-cards">
          <a className="panel cc" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle /><div><b>WhatsApp</b><span>Fastest response</span></div></a>
          <a className="panel cc" href={`tel:${BRAND.phone}`}><Phone /><div><b>{BRAND.phone}</b><span>Mon–Sat, 10am–7pm</span></div></a>
          <a className="panel cc" href={`mailto:${BRAND.email}`}><Mail /><div><b>{BRAND.email}</b><span>Orders & quotes</span></div></a>
          <div className="panel cc"><MapPin /><div><b>{BRAND.legal}</b><span>{BRAND.address}</span></div></div>
        </div>
        <form className="panel fgrid" onSubmit={submit}>
          <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input required type="email" className="span2" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <textarea required className="span2" rows={5} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          <button className="btn dark span2">Send message</button>
        </form>
      </div>
    </div>
  )
}

const FAQS = [
  ['Orders & shipping', [
    ['How long does delivery take?', 'Orders ship in 2–4 business days and arrive in 3–7 days across India. Metro cities are usually faster.'],
    ['Is shipping free?', `Shipping is free above ${inr(BRAND.freeShippingAbove)}. Below that a flat ${inr(BRAND.shippingFee)} applies.`],
    ['Do you offer cash on delivery?', `Yes. A ${inr(BRAND.codFee)} COD fee applies, and we confirm the order with you on WhatsApp before dispatch.`],
  ]],
  ['Products', [
    ['Is borosilicate glass safe with a flame?', 'Yes — it tolerates heat and temperature changes much better than regular glass. Always place it on a level, heat-safe surface and never leave a flame unattended.'],
    ['What oil should I use?', 'Any lamp oil, mustard oil, sesame oil or ghee works. Fill to about two-thirds and use a cotton wick.'],
    ['Can I use a tealight instead?', 'The fluted diya (R3D01) takes a standard tealight. Modak diyas and akhand jyots are designed for oil.'],
  ]],
  ['Returns & bulk', [
    ['What if my item arrives broken?', 'Share an unboxing photo or video within 48 hours and we’ll send a free replacement.'],
    ['What is the minimum for bulk pricing?', '100 pieces per design. Prices drop further at 500 and 1,000+ pieces.'],
    ['Can you match our brand colours?', 'Yes — colourways can be curated or limited to match your palette for corporate orders.'],
  ]],
]
function FaqItem({ q, a }) {
  const [o, setO] = useState(false)
  return <div className="acc"><button onClick={() => setO(!o)}>{q}<motion.span animate={{ rotate: o ? 180 : 0 }}><ChevronDown size={18} /></motion.span></button><AnimatePresence initial={false}>{o && <motion.div className="acc-body" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}><div>{a}</div></motion.div>}</AnimatePresence></div>
}
export function FAQ() {
  return <div className="container page narrow"><h1>Frequently asked questions</h1>{FAQS.map(([h, qs]) => <section key={h} className="faq-sec"><h3>{h}</h3>{qs.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</section>)}<p className="muted">Still stuck? <Link to="/contact">Contact us</Link>.</p></div>
}

const POLICIES = {
  shipping: ['Shipping policy', [`We ship across India through trusted courier partners. Orders are dispatched within 2–4 business days; bulk orders follow the timeline in your quote.`, `Shipping is free on orders above ${inr(BRAND.freeShippingAbove)}; otherwise a flat fee of ${inr(BRAND.shippingFee)} applies. COD orders carry an additional ${inr(BRAND.codFee)}.`, 'You will receive a tracking link by email and SMS once your order ships.']],
  returns: ['Returns & refunds', ['Because our products are fragile and handmade, we accept returns only for items damaged in transit or with manufacturing defects.', 'Report damage within 48 hours of delivery with an unboxing photo or video. We will send a free replacement or a full refund to the original payment method within 5–7 business days.', 'Minor bubbles and slight variations in shape are natural in handmade glass and are not considered defects.']],
  privacy: ['Privacy policy', ['We collect only the information needed to fulfil your order: name, contact details, address and order history.', 'Payments are processed by Razorpay; we never store card details.', 'We never sell your data. You can request deletion of your account at any time by emailing us.']],
  terms: ['Terms of service', [`This site is operated by ${BRAND.legal}, ${BRAND.address}. GSTIN ${BRAND.gstin}.`, 'Prices are in INR and include applicable taxes unless stated. Bulk prices are per piece and exclude GST and shipping.', 'We reserve the right to cancel orders in case of pricing errors or stock unavailability, with a full refund.']],
}
export function Policy() {
  const { slug } = useParams(); const p = POLICIES[slug]
  if (!p) return <NotFound />
  return <div className="container page narrow prose"><h1>{p[0]}</h1>{p[1].map((t, i) => <p key={i}>{t}</p>)}<p className="muted small">Last updated: October 2026</p></div>
}

export function Track() {
  const [no, setNo] = useState(''); const [ph, setPh] = useState(''); const [o, setO] = useState(undefined)
  const steps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
  const go = async (e) => { e.preventDefault(); setO((await api.trackOrder(no.trim(), ph.trim())) || null) }
  return (
    <div className="container page narrow">
      <h1>Track your order</h1>
      <form className="panel fgrid" onSubmit={go}><input required placeholder="Order number (e.g. R312345678)" value={no} onChange={(e) => setNo(e.target.value)} /><input required placeholder="Phone used at checkout" value={ph} onChange={(e) => setPh(e.target.value)} /><button className="btn dark span2"><Search size={16} /> Track</button></form>
      {o === null && <p className="err">No order found with those details.</p>}
      {o && (
        <motion.div className="panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3>#{o.order_no} · {inr(o.total)}</h3>
          {o.status === 'cancelled' ? <p className="err">This order was cancelled.</p> : (
            <div className="timeline">{steps.map((s, i) => <div key={s} className={steps.indexOf(o.status) >= i ? 'on' : ''}><span />{s}</div>)}</div>
          )}
          {o.tracking && <p>Courier tracking: <b>{o.tracking}</b></p>}
        </motion.div>
      )}
    </div>
  )
}

export function NotFound() {
  return <div className="container page empty"><h1 className="huge">404</h1><p>This page has burned out.</p><Link to="/" className="btn dark">Back home</Link></div>
}
