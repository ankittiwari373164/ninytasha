import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, Phone, MapPin, MessageCircle, Search, Flame, Hand, Leaf, Landmark, Copy, FileText, Check } from 'lucide-react'
import { GROUPS, CATEGORIES } from '../data/products'
import CatIcon from '../components/CatIcon'
import { useStore } from '../context/Store'
import { BRAND, inr } from '../lib/config'
import * as api from '../lib/api'
import { useSeo, breadcrumbs, productLd } from '../lib/seo'
import { Reveal } from '../components/Layout'

export function BankDetails({ compact }) {
  const { toast } = useStore()
  const b = BRAND.bank
  const rows = [['Beneficiary', b.beneficiary], ['Bank', b.name], ['Account no.', b.account], ['IFSC', b.ifsc], ['SWIFT', b.swift], ['Branch', b.branch], ['Beneficiary address', b.beneficiaryAddress]]
  const copy = () => { navigator.clipboard?.writeText(rows.map(([k, v]) => `${k}: ${v}`).join('\n')); toast('Bank details copied') }
  return (
    <div className={'panel bank ' + (compact ? 'compact' : '')}>
      <div className="bank-head"><Landmark size={20} /><b>Bank details</b><button type="button" className="btn outline sm" onClick={copy}><Copy size={14} /> Copy</button></div>
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <p className="muted small">For wholesale, export and quote payments. Please share the transfer reference with us on WhatsApp or email.</p>
    </div>
  )
}

export function About() {
  useSeo({ title: 'About Us — Borosilicate Glass Manufacturer since 2000', description: `About ${BRAND.legal}: handcrafted borosilicate glassware manufacturer in Delhi since ${BRAND.since}. Factory at SMA Industrial Area, GTK Road. Retail, wholesale & export.`, path: '/about', jsonLd: breadcrumbs([['Home', '/'], ['About us', '/about']]) })
  const groups = GROUPS.map((g) => [g, CATEGORIES.filter((c) => c.group === g.slug)])
  return (
    <div className="page">
      <section className="bulk-hero about"><div className="container"><Reveal><span className="eyebrow">About us · since {BRAND.since}</span><h1>{BRAND.legal}</h1><p>Manufacturers of handcrafted borosilicate temple & pooja items, kitchenware, barware, home décor and gift items — for homes, temples, hospitality, retail and export.</p></Reveal></div></section>

      <section className="container section story">
        <Reveal className="story-collage">{['kw-58-1', 'kw-65-1', 'kw-59-1', 'kw-72-1'].map((k) => <img key={k} src={`/products/${k}.jpg`} alt="True Glass handcrafted borosilicate glass" loading="lazy" />)}</Reveal>
        <Reveal className="story-text" delay={0.1}>
          <span className="eyebrow d">Our story</span>
          <h2>Glass, made by hand in Delhi</h2>
          <p>{BRAND.legal} was incorporated in {BRAND.since}. From our factory in SMA Industrial Area on GTK Road, we shape and finish borosilicate glass by hand — a glass prized for its clarity and its resistance to heat and sudden temperature change.</p>
          <p>Our range covers temple and pooja items, kitchenware, barware (cocktail and wine glasses), home décor, and handicraft and gift items supplied wholesale. We supply households directly and work with retailers, distributors, hotels, restaurants and corporate buyers in bulk.</p>
        </Reveal>
      </section>

      <section className="container section">
        <div className="mv">
          <Reveal className="mv-card"><span className="eyebrow d">Our mission</span><p>To make beautiful, durable borosilicate glass by hand — and get it to every kitchen, bar, temple and home that wants it, at an honest price.</p></Reveal>
          <Reveal delay={0.1} className="mv-card dark"><span className="eyebrow">Our vision</span><p>To be India’s most trusted name for handcrafted glass, at home and in export markets.</p></Reveal>
        </div>
        <Reveal className="strengths">
          <h3>What sets us apart</h3>
          <ul className="ticks">{['Our own factory and warehouse in Delhi', 'Handcrafted, lead-free borosilicate glass', 'Retail, wholesale and export under one roof', `Registered company since ${BRAND.since} · GST invoicing`, 'Bank transfer & SWIFT payments for bulk buyers'].map((t) => <li key={t}><Check size={16} />{t}</li>)}</ul>
        </Reveal>
      </section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">What we make</span><h2>Our product range</h2></div></div></Reveal>
        <div className="range">
          {groups.map(([g, cats], i) => (
            <Reveal key={g.slug} delay={(i % 3) * 0.08} className="range-card">
              <span className="gt-icon"><CatIcon name={g.icon} size={24} /></span>
              <h3>{g.name}</h3>
              <ul>{cats.map((c) => <li key={c.slug}><Link to={`/shop/${c.slug}`}>{c.name}</Link></li>)}</ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section"><div className="values">
        {[[Hand, 'Commitment to quality', 'Each piece is checked by hand before packing; small variations are the mark of handwork.'], [Flame, 'Built for heat', 'Borosilicate glass handles hot drinks, flames and temperature changes far better than ordinary glass.'], [Leaf, 'Made to last', 'Washable, reusable and lead-free, for years of everyday use.']].map(([I, t, d], i) => (
          <Reveal key={t} delay={i * 0.1} className="value"><I size={28} /><h3>{t}</h3><p>{d}</p></Reveal>
        ))}
      </div></section>

      <section className="container section">
        <Reveal><div className="sec-head center"><div><span className="eyebrow d">Company details</span><h2>Where to find us</h2></div></div></Reveal>
        <div className="facts">
          {BRAND.locations.map((l) => <div key={l.label} className="panel"><span className="sku">{l.label}</span><p><b>{l.address}</b></p></div>)}
          <div className="panel"><span className="sku">Registration</span><p><b>GSTIN {BRAND.gstin}</b><br /><b>CIN {BRAND.cin}</b></p></div>
        </div>
        <div className="center" style={{ marginTop: 24 }}><Link to="/contact" className="btn dark">Contact us</Link></div>
      </section>
    </div>
  )
}

export function Contact() {
  useSeo({ title: 'Contact Us', description: `Contact ${BRAND.legal}: call ${BRAND.phone} / ${BRAND.phone2}, email ${BRAND.email}. Office: ${BRAND.address}.`, path: '/contact', jsonLd: breadcrumbs([['Home', '/'], ['Contact us', '/contact']]) })
  const { toast } = useStore()
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' })
  const submit = async (e) => { e.preventDefault(); await api.createEnquiry({ type: 'contact', ...f }); toast('Message sent — we’ll reply soon'); setF({ name: '', email: '', phone: '', message: '' }) }
  return (
    <div className="container page">
      <h1>Contact us</h1><p className="muted">Questions about an order, wholesale pricing, export or a custom design? Call, WhatsApp or write to us.</p>
      <div className="contact">
        <div className="contact-cards">
          {BRAND.contacts.map((c) => (
            <div key={c.phone} className="panel cc">
              <Phone /><div><b>{c.name}</b><span>{c.phone}</span></div>
              <div className="cc-actions"><a className="icon-btn box" href={`tel:+91${c.phone}`} aria-label="Call"><Phone size={18} /></a><a className="icon-btn box" href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a></div>
            </div>
          ))}
          <a className="panel cc" href={`mailto:${BRAND.email}`}><Mail /><div><b>{BRAND.email}</b><span>Orders, quotes & export enquiries</span></div></a>
          {BRAND.locations.map((l) => (
            <a key={l.label} className="panel cc" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}`} target="_blank" rel="noreferrer"><MapPin /><div><b>{l.label}</b><span>{l.address}</span></div></a>
          ))}
        </div>
        <div className="contact-side">
          <form className="panel fgrid" onSubmit={submit}>
            <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input required type="email" className="span2" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <textarea required className="span2" rows={4} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            <button className="btn dark span2">Send message</button>
          </form>
          <iframe className="map" title="Map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&output=embed`} />
        </div>
      </div>
      <div className="contact-bottom">
        <BankDetails />
        <div className="panel"><div className="bank-head"><FileText size={20} /><b>Company registration</b></div><dl><div><dt>Company</dt><dd>{BRAND.legal}</dd></div><div><dt>GSTIN</dt><dd>{BRAND.gstin}</dd></div><div><dt>CIN</dt><dd>{BRAND.cin}</dd></div><div><dt>Registered office</dt><dd>{BRAND.address}</dd></div></dl></div>
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
    ['Can I use a tealight instead?', 'Yes — both the Modak Diya and the fluted Diya work with oil or a standard tealight.'],
  ]],
  ['Wholesale & export', [
    ['What is the minimum order for wholesale?', 'Wholesale rates start at 100 pieces per design, with lower rates at 500 and 1,000+ pieces.'],
    ['Do you take export orders?', `Yes. We accept international bank transfers (SWIFT ${BRAND.bank.swift}). Email ${BRAND.email} with your requirement for a quote.`],
    ['Can I get a GST invoice?', `Yes — we are a registered company (GSTIN ${BRAND.gstin}). Add your GSTIN at checkout or in your quote request.`],
  ]],
  ['Returns & bulk', [
    ['What if my item arrives broken?', 'Share an unboxing photo or video within 48 hours and we’ll send a free replacement.'],
    ['How do I get wholesale prices?', 'Tap “Get wholesale price” on any product, fill in the quantity and your details, and the form opens WhatsApp with everything filled in. We reply with our wholesale rate. Temple items are packed in 100-piece master boxes.'],
    ['Can I choose colours for a bulk order?', 'Yes — bells and fluted diyas come in Blue, Orange, Pink and Green. Tell us your mix when you order or request a quote.'],
  ]],
]
function FaqItem({ q, a }) {
  const [o, setO] = useState(false)
  return <div className="acc"><button onClick={() => setO(!o)}>{q}<motion.span animate={{ rotate: o ? 180 : 0 }}><ChevronDown size={18} /></motion.span></button><AnimatePresence initial={false}>{o && <motion.div className="acc-body" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}><div>{a}</div></motion.div>}</AnimatePresence></div>
}
export function FAQ() {
  useSeo({ title: 'FAQs', description: 'Answers about shipping, borosilicate glass, wholesale pricing, export orders, GST invoices and returns.', path: '/faq', jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.flatMap(([, qs]) => qs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))) } })
  return <div className="container page narrow"><h1>Frequently asked questions</h1>{FAQS.map(([h, qs]) => <section key={h} className="faq-sec"><h3>{h}</h3>{qs.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</section>)}<p className="muted">Still stuck? <Link to="/contact">Contact us</Link>.</p></div>
}

export function Track() {
  useSeo({ title: 'Track Your Order', path: '/track' })
  const [no, setNo] = useState(''); const [ph, setPh] = useState(''); const [o, setO] = useState(undefined)
  const steps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
  const go = async (e) => { e.preventDefault(); const r = await api.trackOrder(no.trim(), ph.trim()); setO(r ? { ...r, events: r.events || r.tracking_events || [] } : null) }
  return (
    <div className="container page narrow">
      <h1>Track your order</h1>
      <form className="panel fgrid" onSubmit={go}><input required placeholder="Order number (e.g. NT12345678)" value={no} onChange={(e) => setNo(e.target.value)} /><input required placeholder="Phone used at checkout" value={ph} onChange={(e) => setPh(e.target.value)} /><button className="btn dark span2"><Search size={16} /> Track</button></form>
      {o === null && <p className="err">No order found with those details.</p>}
      {o && (
        <motion.div className="panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3>#{o.order_no} · {inr(o.total)}</h3>
          {o.status === 'cancelled' ? <p className="err">This order was cancelled.</p> : (
            <div className="timeline">{steps.map((s, i) => <div key={s} className={steps.indexOf(o.status) >= i ? 'on' : ''}><span />{s}</div>)}</div>
          )}
          {(o.awb || o.courier || o.etd) && (
            <div className="track-meta">
              {o.courier && <span>Courier: <b>{o.courier}</b></span>}
              {o.awb && <span>AWB: <b>{o.awb}</b></span>}
              {o.etd && <span>Expected: <b>{new Date(String(o.etd).replace(' ', 'T')).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</b></span>}
              {o.shipping_status && !String(o.shipping_status).startsWith('ERROR') && <span>Status: <b>{o.shipping_status}</b></span>}
            </div>
          )}
          {!o.awb && o.tracking && <p>Courier tracking: <b>{o.tracking}</b></p>}
          {o.events?.length > 0 && (
            <ul className="events">{o.events.map((ev, i) => <li key={i}><b>{ev.status || ev.activity}</b>{ev.activity && ev.status && ev.activity !== ev.status && <> — {ev.activity}</>}<small>{[ev.location, ev.date].filter(Boolean).join(' · ')}</small></li>)}</ul>
          )}
          {o.tracking_url && <a className="btn outline sm" style={{ marginTop: 16 }} href={o.tracking_url} target="_blank" rel="noreferrer">Open courier tracking page</a>}
        </motion.div>
      )}
    </div>
  )
}

export function NotFound() {
  useSeo({ title: 'Page not found', noindex: true })
  return <div className="container page empty"><h1 className="huge">404</h1><p>This page has burned out.</p><Link to="/" className="btn dark">Back home</Link></div>
}
