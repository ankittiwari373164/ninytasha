import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '../context/Store'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const { cat } = useParams()
  const [sp] = useSearchParams()
  const q = (sp.get('q') || '').toLowerCase()
  const { products, loading } = useStore()
  const [sort, setSort] = useState('featured')
  const [max, setMax] = useState(2000)
  const [pack, setPack] = useState('all')
  const [open, setOpen] = useState(false)
  const category = CATEGORIES.find((c) => c.slug === cat)

  const list = useMemo(() => {
    let l = products.filter((p) => (!cat || p.category === cat) && p.price <= max && (pack === 'all' || (pack === 'single' ? p.pack === 1 : p.pack > 1)))
    if (q) l = l.filter((p) => (p.name + p.sku + p.description + p.category).toLowerCase().includes(q))
    const s = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, featured: (a, b) => b.featured - a.featured }
    return [...l].sort(s[sort])
  }, [products, cat, q, sort, max, pack])

  const Filters = (
    <div className="filters">
      <h4>Category</h4>
      <Link className={!cat ? 'on' : ''} to="/shop">All products</Link>
      {CATEGORIES.map((c) => <Link key={c.slug} className={cat === c.slug ? 'on' : ''} to={`/shop/${c.slug}`}>{c.name}</Link>)}
      <h4>Max price: ₹{max}</h4>
      <input type="range" min={100} max={2000} step={50} value={max} onChange={(e) => setMax(+e.target.value)} />
      <h4>Pack</h4>
      {[['all', 'All'], ['single', 'Single piece'], ['multi', 'Packs & sets']].map(([v, l]) => <label key={v} className="radio"><input type="radio" checked={pack === v} onChange={() => setPack(v)} />{l}</label>)}
    </div>
  )

  return (
    <div className="container page">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link>{category && <> / {category.name}</>}</div>
      <div className="shop-head">
        <div><h1>{q ? `Results for “${q}”` : category?.name || 'All products'}</h1><p className="muted">{list.length} products</p></div>
        <div className="shop-tools">
          <button className="btn outline sm show-m" onClick={() => setOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option></select>
        </div>
      </div>
      <div className="chips show-m">{CATEGORIES.map((c) => <Link key={c.slug} to={`/shop/${c.slug}`} className={'chip ' + (cat === c.slug ? 'on' : '')}>{c.name}</Link>)}</div>
      <div className="shop-layout">
        <aside className="hide-m">{Filters}</aside>
        <div>
          {loading ? <div className="grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" />)}</div>
            : list.length ? <motion.div layout className="grid">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</motion.div>
            : <div className="empty"><h3>Nothing matches yet</h3><p>Try a different filter.</p></div>}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <div className="sheet-head"><b>Filters</b><button className="icon-btn" onClick={() => setOpen(false)}><X /></button></div>
              {Filters}
              <button className="btn dark full" onClick={() => setOpen(false)}>Show {list.length} products</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
