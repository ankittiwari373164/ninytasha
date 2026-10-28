import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Home, LayoutGrid, Heart, ShoppingBag, User, Search, Building2, Instagram, Facebook, Mail, Phone, MapPin, X } from 'lucide-react'
import { useStore } from '../context/Store'
import { BRAND } from '../lib/config'
import * as api from '../lib/api'
import { GROUPS } from '../data/products'

export function AnnouncementBar() {
  const msgs = ['Free shipping on orders above ₹999', 'Wholesale price on request — tap Get wholesale price', 'Call / WhatsApp ' + BRAND.phone]
  return (
    <div className="announce"><div className="announce-track">{[...msgs, ...msgs].map((m, i) => <span key={i}>✦ {m}</span>)}</div></div>
  )
}

export function Navbar() {
  const { count, wish } = useStore()
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const go = (e) => { e.preventDefault(); nav('/shop?q=' + encodeURIComponent(q)); setOpen(false) }
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">Ninytasha<span>·</span>Exports</Link>
        <nav className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop/temple">Temple & Pooja</NavLink>
          <NavLink to="/shop/kitchen">Kitchenware</NavLink>
          <NavLink to="/shop/barware">Barware</NavLink>
          <NavLink to="/shop/home-decor">Home Décor</NavLink>
          <NavLink to="/shop/wholesale-various">Handicraft & Gifts</NavLink>
          <NavLink to="/corporate">Wholesale</NavLink>
                    <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="nav-icons">
          <button className="icon-btn" aria-label="Search" onClick={() => setOpen((o) => !o)}><Search size={20} /></button>
          <Link to="/wishlist" className="icon-btn hide-m" aria-label="Wishlist"><Heart size={20} />{wish.length > 0 && <b className="badge">{wish.length}</b>}</Link>
          <Link to="/account" className="icon-btn hide-m" aria-label="Account"><User size={20} /></Link>
          <Link to="/cart" className="icon-btn hide-m" aria-label="Cart"><ShoppingBag size={20} />{count > 0 && <motion.b key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="badge">{count}</motion.b>}</Link>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.form onSubmit={go} className="search-drop" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="container search-row">
              <Search size={18} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search glasses, mugs, diyas, vases…" />
              <button type="button" className="icon-btn" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </header>
  )
}

export function BottomNav() {
  const { count, wish } = useStore()
  const items = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/shop', icon: LayoutGrid, label: 'Shop' },
    { to: '/corporate', icon: Building2, label: 'Bulk' },
    { to: '/wishlist', icon: Heart, label: 'Saved', n: wish.length },
    { to: '/cart', icon: ShoppingBag, label: 'Bag', n: count },
    { to: '/account', icon: User, label: 'Me' },
  ]
  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon: I, label, n, end }) => (
        <NavLink key={to} to={to} end={end} className="bn-item">
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="bn-pill" className="bn-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="bn-icon"><I size={21} strokeWidth={isActive ? 2.4 : 1.8} />{n > 0 && <b className="badge">{n}</b>}</span>
              <span className="bn-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function Footer() {
  const { toast } = useStore(); const [email, setEmail] = useState('')
  const sub = async (e) => { e.preventDefault(); try { await api.subscribe(email); setEmail(''); toast('Subscribed — welcome to the glow!') } catch (er) { toast(er.message) } }
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo light">Ninytasha<span>·</span>Exports</div>
          <p className="muted-l">{BRAND.tagline}. Manufacturer since {BRAND.since} · retail, wholesale & export.</p>
          <form className="news" onSubmit={sub}><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email for festive offers" /><button className="btn gold sm">Join</button></form>
          <div className="social"><a href="#" aria-label="Instagram"><Instagram size={18} /></a><a href="#" aria-label="Facebook"><Facebook size={18} /></a></div>
        </div>
        <div><h4>Shop</h4>{GROUPS.map((g) => <Link key={g.slug} to={`/shop/${g.slug}`}>{g.name}</Link>)}<Link to="/corporate">Wholesale & Export</Link></div>
        <div><h4>Help</h4><Link to="/track">Track Order</Link><Link to="/faq">FAQs</Link><Link to="/shipping-policy">Shipping & Delivery</Link><Link to="/cancellation-and-refund-policy">Cancellation & Refund</Link><Link to="/contact">Contact Us</Link><Link to="/about">About Us</Link></div>
        <div><h4>Reach us</h4>
          {BRAND.contacts.map((c) => <a key={c.phone} className="ci" href={`tel:+91${c.phone}`}><Phone size={15} />{c.phone} · {c.name}</a>)}
          <a className="ci" href={`mailto:${BRAND.email}`}><Mail size={15} />{BRAND.email}</a>
          <a className="ci" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`} target="_blank" rel="noreferrer"><MapPin size={15} />{BRAND.address}</a>
          <p className="ci"><MapPin size={15} />Factory: {BRAND.locations[1].address}</p>
          <p className="muted-l small">GSTIN {BRAND.gstin}<br />CIN {BRAND.cin}</p>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} {BRAND.legal}</span><span className="legal-links"><Link to="/privacy-policy">Privacy Policy</Link> · <Link to="/terms-and-conditions">Terms & Conditions</Link> · <Link to="/cancellation-and-refund-policy">Refunds</Link> · <Link to="/sitemap">Sitemap</Link></span></div>
    </footer>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts">
      <AnimatePresence>
        {toasts.map((t) => <motion.div key={t.id} className="toast" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}>{t.msg}</motion.div>)}
      </AnimatePresence>
    </div>
  )
}

export const Reveal = ({ children, delay = 0, className }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}>{children}</motion.div>
)
