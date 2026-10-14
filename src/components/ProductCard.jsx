import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Star, Plus } from 'lucide-react'
import { useStore } from '../context/Store'
import { inr } from '../lib/config'
import { unitLabel, COLOR_HEX, isIllustration } from '../data/products'

export default function ProductCard({ p, i = 0 }) {
  const { addToCart, wish, toggleWish } = useStore()
  const saved = wish.includes(p.id)
  const wsFrom = p.tiers?.length ? Math.min(...p.tiers.map((t) => t.price)) : null
  return (
    <motion.article className="card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 4) * 0.07 }} whileHover={{ y: -6 }}>
      <Link to={`/product/${p.id}`} className="card-img">
        <img src={p.images?.[0]} alt={p.name} loading="lazy" />
        {p.pack > 1 && <span className="tag dark">Combo · {p.pack} pcs</span>}
        {isIllustration(p.images?.[0]) && <span className="illus-tag">Illustration · photo soon</span>}
      </Link>
      <motion.button whileTap={{ scale: 0.8 }} className={'wish ' + (saved ? 'on' : '')} onClick={() => toggleWish(p.id)} aria-label="Save"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></motion.button>
      <div className="card-body">
        <span className="sku">{p.sku}{p.size && p.size.length < 12 ? ` · ${p.size}` : ''}</span>
        <Link to={`/product/${p.id}`} className="card-title">{p.name}</Link>
        {p.reviews > 0 && <div className="rating"><Star size={13} fill="currentColor" /> {p.rating} <span>({p.reviews})</span></div>}
        {p.colors?.length > 0 && <div className="dots">{p.colors.map((c) => <i key={c} title={c} style={{ background: COLOR_HEX[c] || '#ccc' }} />)}</div>}
        <div className="card-foot">
          <div className="price">{inr(p.price)}<small> /{p.pack > 1 ? 'combo' : 'pc'}</small></div>
          <motion.button whileTap={{ scale: 0.85 }} className="add" onClick={() => addToCart(p, 1, p.colors?.[0])} aria-label="Add to bag"><Plus size={18} /></motion.button>
        </div>
        {wsFrom && <div className="ws-line">Wholesale from <b>{inr(wsFrom)}</b>/{unitLabel(p, 'wholesale')}</div>}
      </div>
    </motion.article>
  )
}