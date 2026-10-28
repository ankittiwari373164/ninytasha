import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Palette, Package, FileCheck, Truck, Check } from 'lucide-react'
import { useStore } from '../context/Store'
import WholesaleButton from '../components/WholesaleEnquiry'
import { inr, BRAND } from '../lib/config'
import { Link } from 'react-router-dom'
import { unitLabel } from '../data/products'
import * as api from '../lib/api'
import { Reveal } from '../components/Layout'
import { useSeo, breadcrumbs, productLd } from '../lib/seo'
import { BankDetails } from './Info'

export default function Bulk() {
  useSeo({ title: 'Wholesale, Bulk & Export Orders', description: 'Wholesale borosilicate glass diyas, akhand jyot, temple bells and cocktail glasses from our Delhi factory — wholesale price on request, GST invoice, pan-India and export shipping. Request a quote.', path: '/corporate' })
  const { products, toast } = useStore()
  const [sp] = useSearchParams()
  const [f, setF] = useState({ name: '', company: '', email: '', phone: '', sku: sp.get('sku') || '', qty: 100, deadline: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    try { await api.createEnquiry({ type: 'bulk', name: f.name, company: f.company, email: f.email, phone: f.phone, message: `SKU: ${f.sku}\nQty: ${f.qty}\nNeeded by: ${f.deadline}\n\n${f.message}` }); setSent(true) } catch (er) { toast(er.message) }
  }

  return (
    <div className="page">
      <section className="bulk-hero">
        <div className="container">
          <Reveal><span className="eyebrow">Wholesale · Export · Corporate gifting</span><h1>Handcrafted glass, by the carton</h1><p>Temple & pooja items and handcrafted barware straight from our Delhi factory — wholesale price on request, GST invoicing, pan-India and export shipping.</p><a href="#quote" className="btn gold">Request a quote</a></Reveal>
        </div>
      </section>

      <section className="container section">
        <div className="steps">
          {[[Building2, 'Tell us the brief', 'Quantity, budget, deadline'], [Palette, 'Curate colours', 'Matched to your brand palette'], [Package, 'Gift-box & brand', 'Sleeves, cards, logo stickers'], [Truck, 'Pan-India delivery', 'Single or multi-address']].map(([I, t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="step"><span className="step-n">0{i + 1}</span><I /><b>{t}</b><span>{d}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Wholesale price list</h2>
        <p className="muted">Retail prices are shown below. For wholesale rates, tap <b>Get wholesale price</b> on any product — we’ll reply on WhatsApp.</p>
        <div className="table-wrap">
          <table className="ptable">
            <thead><tr><th>Product</th><th>Code</th><th>Retail price</th><th>Wholesale</th></tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/product/${p.id}`} className="tcell"><img src={p.images[0]} alt="" />{p.name}</Link></td>
                <td>{p.sku}</td>
                <td>{inr(p.price)}<small className="muted">/{unitLabel(p)}</small></td>
                <td><WholesaleButton product={p} variant="card" label="Get price" /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="muted small">Temple items ship in 100-piece master boxes. Wholesale rates exclude GST and freight.</p>
      </section>

      <section className="container section quote-wrap" id="quote">
        <div>
          <h2>Request a quote</h2>
          <ul className="ticks">{['Tier pricing from 100 pcs', 'Choose your colour mix', 'Pan-India delivery', `Call ${BRAND.phone}`].map((t) => <li key={t}><Check size={16} />{t}</li>)}</ul>
          <FileCheck size={80} strokeWidth={1} className="ghost-icon" />
        </div>
        {sent ? (
          <motion.div className="panel center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><div className="tick sm"><Check /></div><h3>Thanks, {f.name.split(' ')[0]}!</h3><p>We'll send your quote to {f.email} shortly.</p></motion.div>
        ) : (
          <form className="panel fgrid" onSubmit={submit}>
            <input required placeholder="Your name" value={f.name} onChange={set('name')} />
            <input required placeholder="Company" value={f.company} onChange={set('company')} />
            <input required type="email" placeholder="Work email" value={f.email} onChange={set('email')} />
            <input required placeholder="Phone" value={f.phone} onChange={set('phone')} />
            <select value={f.sku} onChange={set('sku')}><option value="">Product (any / mixed)</option>{products.map((p) => <option key={p.id} value={p.sku}>{p.sku} — {p.name}</option>)}</select>
            <input type="number" min={100} placeholder="Quantity" value={f.qty} onChange={set('qty')} />
            <label className="span2 lbl">Needed by<input type="date" value={f.deadline} onChange={set('deadline')} /></label>
            <textarea className="span2" rows={3} placeholder="Branding, colours, budget per gift, delivery cities…" value={f.message} onChange={set('message')} />
            <button className="btn dark span2">Send request</button>
          </form>
        )}
      </section>

      <section className="container section"><BankDetails /></section>
    </div>
  )
}
