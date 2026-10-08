import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Star, Plus } from 'lucide-react'
import { useStore } from '../context/Store'
import { inr } from '../lib/config'

export default function ProductCard({ p, i = 0 }) {
  const { addToCart, wish, toggleWish } = useStore()
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
  const saved = wish.includes(p.id)
  return (
    <motion.article className="card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 4) * 0.07 }} whileHover={{ y: -6 }}>
      <Link to={`/product/${p.id}`} className="card-img">
        <img src={p.images?.[0]} alt={p.name} loading="lazy" />
        {p.min_qty > 1 ? <span className="tag dark">Bulk · MOQ {p.min_qty}</span> : off > 0 && <span className="tag">{off}% off</span>}
      </Link>
      <motion.button whileTap={{ scale: 0.8 }} className={'wish ' + (saved ? 'on' : '')} onClick={() => toggleWish(p.id)} aria-label="Save"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></motion.button>
      <div className="card-body">
        <span className="sku">{p.sku}{p.pack > 1 ? ` · ${p.pack} pcs` : ''}</span>
        <Link to={`/product/${p.id}`} className="card-title">{p.name}</Link>
        <div className="rating"><Star size={13} fill="currentColor" /> {p.rating} <span>({p.reviews})</span></div>
        <div className="card-foot">
          <div className="price">{p.tiers ? <small>from </small> : null}{inr(p.tiers ? p.tiers[p.tiers.length - 1].price : p.price)}{p.tiers ? <small>/pc</small> : p.mrp > p.price && <s>{inr(p.mrp)}</s>}</div>
          <motion.button whileTap={{ scale: 0.85 }} className="add" onClick={() => addToCart(p, p.min_qty || 1, p.colors?.[0])} aria-label="Add to bag"><Plus size={18} /></motion.button>
        </div>
      </div>
    </motion.article>
  )
}
