import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '../context/Store'
import { BRAND, inr } from '../lib/config'

export default function Cart() {
  const { lines, subtotal, setQty, removeItem } = useStore()
  const shipping = subtotal >= BRAND.freeShippingAbove || !subtotal ? 0 : BRAND.shippingFee
  const left = BRAND.freeShippingAbove - subtotal

  if (!lines.length) return (
    <div className="container page empty">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><ShoppingBag size={56} strokeWidth={1.2} /></motion.div>
      <h2>Your bag is empty</h2><p>Light up someone's festival — start with our bestsellers.</p>
      <Link to="/shop" className="btn dark">Start shopping</Link>
    </div>
  )

  return (
    <div className="container page">
      <h1>Your bag</h1>
      {left > 0 ? (
        <div className="ship-bar"><p>Add <b>{inr(left)}</b> more for free shipping</p><div><motion.span initial={{ width: 0 }} animate={{ width: `${Math.min(100, (subtotal / BRAND.freeShippingAbove) * 100)}%` }} /></div></div>
      ) : <div className="ship-bar ok"><p>🎉 You've unlocked free shipping</p></div>}
      <div className="cart-layout">
        <div className="lines">
          <AnimatePresence>
            {lines.map((l) => (
              <motion.div layout key={l.key} className="line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -60 }}>
                <Link to={`/product/${l.id}`}><img src={l.product.images[0]} alt="" /></Link>
                <div className="line-info">
                  <Link to={`/product/${l.id}`} className="card-title">{l.product.name}</Link>
                  <span className="muted small">{l.product.sku}{l.color ? ` · ${l.color}` : ''}</span>
                  <span className="muted small">{inr(l.price)} each</span>
                  <div className="qty sm"><button onClick={() => setQty(l.key, l.qty - (l.product.min_qty > 1 ? 50 : 1))}><Minus size={14} /></button><span>{l.qty}</span><button onClick={() => setQty(l.key, l.qty + (l.product.min_qty > 1 ? 50 : 1))}><Plus size={14} /></button></div>
                </div>
                <div className="line-end"><b>{inr(l.total)}</b><button className="icon-btn" onClick={() => removeItem(l.key)} aria-label="Remove"><Trash2 size={18} /></button></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <aside className="summary">
          <h3>Order summary</h3>
          <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
          <div className="row"><span>Shipping</span><b>{shipping ? inr(shipping) : 'Free'}</b></div>
          <p className="muted small">Coupons applied at checkout</p>
          <div className="row total"><span>Total</span><b>{inr(subtotal + shipping)}</b></div>
          <Link to="/checkout" className="btn dark full">Checkout</Link>
          <Link to="/shop" className="btn outline full">Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
