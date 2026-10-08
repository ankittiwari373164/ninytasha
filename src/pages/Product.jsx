import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Minus, Plus, Star, Truck, RotateCcw, ShieldCheck, ChevronDown, Share2 } from 'lucide-react'
import { useStore } from '../context/Store'
import { unitPrice } from '../data/products'
import { inr } from '../lib/config'
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

export default function Product() {
  const { id } = useParams()
  const nav = useNavigate()
  const { products, addToCart, wish, toggleWish, user, toast } = useStore()
  const p = products.find((x) => x.id === id)
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState()
  const [img, setImg] = useState(0)
  const [reviews, setReviews] = useState([])
  const [rv, setRv] = useState({ rating: 5, text: '', name: '' })

  useEffect(() => { if (p) { setQty(p.min_qty || 1); setColor(p.colors?.[0]); setImg(0); api.listReviews(p.id).then(setReviews) } }, [p?.id])
  if (!p) return <div className="container page empty"><h3>Loading product…</h3></div>

  const price = unitPrice(p, qty)
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const step = p.min_qty > 1 ? 50 : 1
  const submitReview = async (e) => {
    e.preventDefault()
    await api.addReview({ product_id: p.id, rating: rv.rating, body: rv.text, name: rv.name || user?.name || 'Customer', approved: !api.isLive })
    toast(api.isLive ? 'Thanks! Your review will appear after approval.' : 'Review added'); setRv({ rating: 5, text: '', name: '' })
    api.listReviews(p.id).then(setReviews)
  }
  const share = () => { navigator.share ? navigator.share({ title: p.name, url: location.href }) : (navigator.clipboard.writeText(location.href), toast('Link copied')) }

  return (
    <div className="container page">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to={`/shop/${p.category}`}>Shop</Link> / {p.sku}</div>
      <div className="pdp">
        <div className="gallery">
          <div className="main-img">
            <AnimatePresence mode="wait"><motion.img key={img} src={p.images[img]} alt={p.name} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} /></AnimatePresence>
          </div>
          {p.images.length > 1 && <div className="thumbs">{p.images.map((s, i) => <img key={i} src={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)} alt="" />)}</div>}
        </div>
        <div className="pdp-info">
          <span className="sku">{p.sku} · {p.pack > 1 ? `${p.pack} pieces` : 'Single piece'}</span>
          <h1>{p.name}</h1>
          <div className="rating big"><Star size={16} fill="currentColor" /> {p.rating} <span>· {p.reviews + reviews.length} reviews</span></div>
          <div className="pdp-price">
            <b>{inr(price)}</b>{p.tiers ? <span className="muted">/ piece</span> : off > 0 && <><s>{inr(p.mrp)}</s><span className="save">Save {off}%</span></>}
          </div>
          <p className="muted small">Inclusive of all taxes</p>

          {p.tiers && (
            <div className="tiers">
              {p.tiers.map((t, i) => {
                const next = p.tiers[i + 1]; const on = qty >= t.min && (!next || qty < next.min)
                return <button key={t.min} className={on ? 'on' : ''} onClick={() => setQty(t.min)}><span>{t.min}{next ? `–${next.min - 1}` : '+'} pcs</span><b>{inr(t.price)}</b></button>
              })}
            </div>
          )}

          {p.colors?.length > 0 && (
            <><h4 className="opt-h">Colour: <span>{color}</span></h4>
              <div className="swatches">{p.colors.map((c) => <button key={c} className={c === color ? 'on' : ''} onClick={() => setColor(c)}>{c}</button>)}</div></>
          )}

          <div className="buy-row">
            <div className="qty"><button onClick={() => setQty(Math.max(p.min_qty || 1, qty - step))}><Minus size={16} /></button><input value={qty} onChange={(e) => setQty(+e.target.value || 1)} onBlur={() => setQty(Math.max(p.min_qty || 1, qty))} /><button onClick={() => setQty(qty + step)}><Plus size={16} /></button></div>
            <motion.button whileTap={{ scale: 0.96 }} className="btn dark grow" onClick={() => addToCart(p, qty, color)}>Add to bag · {inr(price * qty)}</motion.button>
            <button className={'icon-btn box ' + (wish.includes(p.id) ? 'on' : '')} onClick={() => toggleWish(p.id)}><Heart size={20} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /></button>
          </div>
          <button className="btn gold full" onClick={() => { addToCart(p, qty, color); nav('/checkout') }}>Buy now</button>
          {p.min_qty > 1 && <p className="note">Minimum order {p.min_qty} pcs. Need branding or custom colours? <Link to={`/corporate?sku=${p.sku}`}>Request a quote</Link></p>}
          <button className="link share" onClick={share}><Share2 size={15} /> Share</button>

          <div className="perks"><div><Truck size={18} />Free shipping over ₹999</div><div><RotateCcw size={18} />7-day breakage replacement</div><div><ShieldCheck size={18} />Secure payments</div></div>

          <Acc title="Description" open>{p.description}</Acc>
          <Acc title="Care & use">Place on a heat-safe, level surface. Fill up to ⅔ with lamp oil or ghee and trim the wick to 3–4 mm. Never leave a flame unattended. Let the glass cool fully before washing in warm soapy water.</Acc>
          <Acc title="Shipping & returns">Ships in 2–4 business days, delivered in 3–7 days across India. Every piece is bubble-wrapped and double-boxed. If anything arrives broken, send an unboxing photo within 48 hours for a free replacement.</Acc>
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
            {reviews.length === 0 && <p className="muted">No written reviews yet — be the first.</p>}
            {reviews.map((r) => <div key={r.id} className="rev"><div className="stars">{[...Array(r.rating)].map((_, k) => <Star key={k} size={13} fill="currentColor" />)}</div><p>{r.body}</p><b>{r.name}</b></div>)}
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="section"><h2>You may also like</h2><div className="grid">{related.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div></section>}

      <div className="sticky-buy show-m">
        <div><b>{inr(price * qty)}</b><span>{qty} × {inr(price)}</span></div>
        <button className="btn dark" onClick={() => addToCart(p, qty, color)}>Add to bag</button>
      </div>
    </div>
  )
}
