import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Minus, Plus, Star, Truck, RotateCcw, ShieldCheck, ChevronDown, Share2, Gem, Flame, Sparkles, Hand, Phone, MessageCircle } from 'lucide-react'
import { useStore } from '../context/Store'
import { unitPrice, minQty, unitLabel, COLOR_HEX } from '../data/products'
import { inr, BRAND } from '../lib/config'
import * as api from '../lib/api'
import ProductCard from '../components/ProductCard'

function Acc({ title, children, open: o = false }) {
  const [open, setOpen] = useState(o)
  return (
    <div className="acc">
      <button onClick={() => setOpen(!open)}>{title}<motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={18} /></motion.span></button>
      <AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="acc-body"><div>{children}</div></motion.div>}</AnimatePresence>
    </div>
  )
}

const FEATURES = [[Gem, 'Premium Borosilicate Glass'], [Flame, 'Heat Resistant'], [Sparkles, 'Crystal Clarity'], [Hand, 'Hand Finished']]

export default function Product() {
  const { id } = useParams()
  const nav = useNavigate()
  const { products, addToCart, wish, toggleWish, user, toast } = useStore()
  const p = products.find((x) => x.id === id)
  const [mode, setMode] = useState('retail')
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState()
  const [img, setImg] = useState(0)
  const [reviews, setReviews] = useState([])
  const [rv, setRv] = useState({ rating: 5, text: '', name: '' })

  useEffect(() => { if (p) { setMode('retail'); setQty(1); setColor(p.colors?.[0]); setImg(0); api.listReviews(p.id).then(setReviews) } }, [p?.id])
  if (!p) return <div className="container page empty"><h3>Loading product…</h3></div>

  const hasWs = p.tiers?.length > 0
  const price = unitPrice(p, qty, mode)
  const unit = unitLabel(p, mode)
  const step = mode === 'wholesale' ? 10 : 1
  const min = minQty(p, mode)
  const wsFrom = hasWs ? Math.min(...p.tiers.map((t) => t.price)) : 0
  const related = products.filter((x) => x.id !== p.id).slice(0, 4)
  const switchMode = (m) => { setMode(m); setQty(minQty(p, m)) }
  const add = () => addToCart(p, qty, color, mode)

  const submitReview = async (e) => {
    e.preventDefault()
    await api.addReview({ product_id: p.id, rating: rv.rating, body: rv.text, name: rv.name || user?.name || 'Customer', approved: !api.isLive })
    toast(api.isLive ? 'Thanks! Your review will appear after approval.' : 'Review added'); setRv({ rating: 5, text: '', name: '' })
    api.listReviews(p.id).then(setReviews)
  }
  const share = () => { navigator.share ? navigator.share({ title: p.name, url: location.href }) : (navigator.clipboard.writeText(location.href), toast('Link copied')) }
  const waText = encodeURIComponent(`Hi ${BRAND.name}, I'm interested in ${p.sku} ${p.name}${mode === 'wholesale' ? ` — wholesale, ${qty} ${unit}` : ''}.`)

  return (
    <div className="container page">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop/${p.category}`}>Shop</Link> / {p.sku}</div>
      <div className="pdp">
        <div className="gallery">
          <div className="main-img">
            <AnimatePresence mode="wait"><motion.img key={img} src={p.images[img]} alt={p.name} className={/poster/.test(p.images[img]) ? 'contain' : ''} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} /></AnimatePresence>
          </div>
          {p.images.length > 1 && <div className="thumbs">{p.images.map((s, i) => <img key={i} src={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)} alt="" />)}</div>}
        </div>

        <div className="pdp-info">
          <span className="sku">{BRAND.productBrand} · {p.sku}</span>
          <h1>{p.name}</h1>
          {p.reviews + reviews.length > 0 && <div className="rating big"><Star size={16} fill="currentColor" /> {p.rating || 5} <span>· {p.reviews + reviews.length} reviews</span></div>}
          <p className="lead">{p.description}</p>

          {hasWs && (
            <div className="mode-toggle" role="tablist">
              <motion.span className="mode-pill" initial={false} animate={{ x: mode === 'retail' ? '0%' : '100%' }} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
              {[['retail', 'Retail', `${inr(p.price)} / ${unitLabel(p)}`], ['wholesale', 'Wholesale', `from ${inr(wsFrom)} / ${unitLabel(p, 'wholesale')}`]].map(([v, l, s]) => (
                <button key={v} role="tab" aria-selected={mode === v} className={mode === v ? 'on' : ''} onClick={() => switchMode(v)}><b>{l}</b><span>{s}</span></button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              <div className="pdp-price"><b>{inr(price)}</b><span className="muted">/ {unit}</span></div>
              <p className="muted small">{mode === 'wholesale' ? 'Excl. GST & shipping · minimum ' + min + ' ' + unit + 's' : 'Inclusive of all taxes'}</p>

              {mode === 'wholesale' ? (
                <div className="tier-table">
                  <div className="tt-head"><span>Quantity</span>{p.tiers.some((t) => t.carton) && <span>Master carton</span>}<span>Rate / {unit}</span></div>
                  {p.tiers.map((t, i) => {
                    const next = p.tiers[i + 1]; const on = qty >= t.min && (!next || qty < next.min)
                    return (
                      <button key={t.min} className={'tt-row ' + (on ? 'on' : '')} onClick={() => setQty(t.min)}>
                        <span>{t.min.toLocaleString('en-IN')}{next ? ` – ${(next.min - 1).toLocaleString('en-IN')}` : '+'} {unit}s</span>
                        {p.tiers.some((x) => x.carton) && <span>{t.carton ? `${t.carton} pcs` : '—'}</span>}
                        <b>{inr(t.price)}</b>
                      </button>
                    )
                  })}
                </div>
              ) : hasWs && (
                <button className="ws-hint" onClick={() => switchMode('wholesale')}>Buying {p.tiers[0].min}+? Wholesale from <b>{inr(wsFrom)}/{unitLabel(p, 'wholesale')}</b> →</button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="specs">
            {p.size && <div><span>Size</span><b>{p.size}</b></div>}
            {p.pack > 1 && <div><span>Pieces</span><b>{p.pack} in combo</b></div>}
          </div>

          {p.colors?.length > 0 && (
            <><h4 className="opt-h">Colour: <span>{color}</span></h4>
              <div className="swatches">{p.colors.map((c) => <button key={c} className={c === color ? 'on' : ''} onClick={() => setColor(c)}><i style={{ background: COLOR_HEX[c] || '#ccc' }} />{c}</button>)}</div>
              {p.color_note && <p className="muted small" style={{ marginTop: 6 }}>{p.color_note}</p>}</>
          )}

          <div className="buy-row">
            <div className="qty"><button onClick={() => setQty(Math.max(min, qty - step))}><Minus size={16} /></button><input inputMode="numeric" value={qty} onChange={(e) => setQty(+e.target.value.replace(/\D/g, '') || 0)} onBlur={() => setQty(Math.max(min, qty))} /><button onClick={() => setQty(qty + step)}><Plus size={16} /></button></div>
            <motion.button whileTap={{ scale: 0.96 }} className="btn dark grow" onClick={add}>Add to bag · {inr(price * Math.max(qty, min))}</motion.button>
            <button className={'icon-btn box ' + (wish.includes(p.id) ? 'on' : '')} onClick={() => toggleWish(p.id)} aria-label="Save"><Heart size={20} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <button className="btn gold full" onClick={() => { add(); nav('/checkout') }}>Buy now</button>

          <div className="contact-strip">
            <a href={`tel:+91${BRAND.phone}`}><Phone size={16} /> {BRAND.phone}</a>
            <a href={`https://wa.me/${BRAND.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp us</a>
            <button onClick={share}><Share2 size={16} /> Share</button>
          </div>
          {mode === 'wholesale' && <p className="note">Need custom colours, branding or a GST quote? <Link to={`/corporate?sku=${p.sku}`}>Request a quote</Link></p>}

          <div className="feats">{FEATURES.map(([I, t]) => <div key={t}><span><I size={20} /></span>{t}</div>)}</div>
          <div className="perks"><div><Truck size={18} />Free shipping over {inr(BRAND.freeShippingAbove)}</div><div><RotateCcw size={18} />Breakage replacement</div><div><ShieldCheck size={18} />Secure payments</div></div>

          <Acc title="Care & use">Place on a heat-safe, level surface. For oil, fill up to ⅔ and trim the cotton wick to 3–4 mm; or drop in a standard tealight. Never leave a flame unattended. Let the glass cool fully before washing in warm soapy water.</Acc>
          <Acc title="Shipping & returns">Ships in 2–4 business days across India. Every piece is bubble-wrapped and boxed. If anything arrives broken, send an unboxing photo within 48 hours for a replacement.</Acc>
        </div>
      </div>

      <section className="section reviews">
        <h2>Customer reviews</h2>
        <div className="rev-grid">
          <form className="rev-form" onSubmit={submitReview}>
            <h4>Write a review</h4>
            <div className="stars pick">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRv({ ...rv, rating: n })}><Star size={22} fill={n <= rv.rating ? 'currentColor' : 'none'} /></button>)}</div>
            <input placeholder="Your name" value={rv.name} onChange={(e) => setRv({ ...rv, name: e.target.value })} />
            <textarea required rows={3} placeholder="How did it look once lit?" value={rv.text} onChange={(e) => setRv({ ...rv, text: e.target.value })} />
            <button className="btn dark">Submit review</button>
          </form>
          <div className="rev-list">
            {reviews.length === 0 && <p className="muted">No reviews yet — be the first.</p>}
            {reviews.map((r) => <div key={r.id} className="rev"><div className="stars">{[...Array(r.rating)].map((_, k) => <Star key={k} size={13} fill="currentColor" />)}</div><p>{r.body}</p><b>{r.name}</b></div>)}
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="section"><h2>More from the collection</h2><div className="grid">{related.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div></section>}

      <div className="sticky-buy show-m">
        <div><b>{inr(price * Math.max(qty, min))}</b><span>{qty} × {inr(price)} · {mode}</span></div>
        <button className="btn dark" onClick={add}>Add to bag</button>
      </div>
    </div>
  )
}
