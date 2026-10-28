import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Tag } from 'lucide-react'
import { BRAND, inr } from '../lib/config'
import * as api from '../lib/api'

/**
 * "Get wholesale price" button → small form → opens WhatsApp with the filled details
 * and saves the enquiry to Admin → Enquiries.
 * <WholesaleButton product={p} variant="card" | "full" />
 */
export default function WholesaleButton({ product, variant = 'full', label = 'Get wholesale price' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={variant === 'card' ? 'ws-btn' : 'btn ws-full'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}>
        <Tag size={variant === 'card' ? 14 : 18} /> {label}
      </button>
      {createPortal(<AnimatePresence>{open && <EnquiryForm product={product} onClose={() => setOpen(false)} />}</AnimatePresence>, document.body)}
    </>
  )
}

function EnquiryForm({ product: p, onClose }) {
  const [f, setF] = useState({ name: '', phone: '', company: '', city: '', qty: 100, colour: '', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const lines = [
      `Hello ${BRAND.name}, I would like the *wholesale price* for:`,
      p ? `• ${p.sku} — ${p.name}` : '• Your product range',
      p ? `• Retail price on website: ${inr(p.price)}${p.pack > 1 ? ` (pack of ${p.pack})` : ''}` : null,
      `• Quantity required: ${f.qty}`,
      f.colour ? `• Colour / design: ${f.colour}` : null,
      '',
      `Name: ${f.name}`,
      `Mobile: ${f.phone}`,
      f.company ? `Business: ${f.company}` : null,
      f.city ? `City: ${f.city}` : null,
      f.message ? `Note: ${f.message}` : null,
      p ? `Link: ${window.location.origin}/product/${p.id}` : null,
    ].filter((x) => x !== null)
    const text = lines.join('\n')
    // Open WhatsApp first (synchronously, so phones don't block the popup), then save the enquiry
    window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    api.createEnquiry({ type: 'wholesale', name: f.name, phone: f.phone, email: '', company: f.company, message: text }).catch(() => {})
    onClose()
  }

  return (
    <>
      <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="modal ws-modal" role="dialog" aria-label="Get wholesale price" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}>
        <div className="sheet-head"><b>Get wholesale price</b><button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button></div>
        {p && (
          <div className="mini ws-product">
            <img src={p.images?.[0]} alt="" />
            <div><b>{p.name}</b><span>{p.sku} · Retail {inr(p.price)}{p.pack > 1 ? ` / pack of ${p.pack}` : ''}</span></div>
          </div>
        )}
        <form className="fgrid" onSubmit={submit}>
          <input required placeholder="Your name *" value={f.name} onChange={set('name')} autoComplete="name" />
          <input required type="tel" pattern="[0-9+ ]{10,14}" placeholder="Mobile number *" value={f.phone} onChange={set('phone')} autoComplete="tel" />
          <input placeholder="Shop / company name" value={f.company} onChange={set('company')} autoComplete="organization" />
          <input placeholder="City" value={f.city} onChange={set('city')} autoComplete="address-level2" />
          <label className="lbl">Quantity required *<input required type="number" min={1} value={f.qty} onChange={set('qty')} /></label>
          <label className="lbl">Colour / design<input placeholder="e.g. assorted, blue" value={f.colour} onChange={set('colour')} /></label>
          <textarea className="span2" rows={2} placeholder="Anything else? (delivery date, branding, packing…)" value={f.message} onChange={set('message')} />
          <button className="btn wa span2"><MessageCircle size={18} /> Send on WhatsApp</button>
          <p className="muted small span2 center">Opens WhatsApp to {BRAND.phone} with these details filled in. We usually reply within a few hours.</p>
        </form>
      </motion.div>
    </>
  )
}
