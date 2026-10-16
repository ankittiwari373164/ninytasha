import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MessageCircle, FileText } from 'lucide-react'
import { useStore } from '../context/Store'
import { CATEGORIES, GROUPS, groupOf } from '../data/products'
import ProductCard from '../components/ProductCard'
import CatIcon from '../components/CatIcon'
import { useSeo, breadcrumbs, productLd } from '../lib/seo'
import { BRAND } from '../lib/config'

export default function Shop() {
  const { cat } = useParams()
  const [sp] = useSearchParams()
  const q = (sp.get('q') || '').toLowerCase()
  const { products, loading } = useStore()
  const [sort, setSort] = useState('featured')
  const [max, setMax] = useState(5000)
  const [pack, setPack] = useState('all')
  const [open, setOpen] = useState(false)

  const group = GROUPS.find((g) => g.slug === cat)
  const category = CATEGORIES.find((c) => c.slug === cat)
  const activeGroup = group?.slug || (category && category.group)
  const title = q ? `Results for “${q}”` : group?.name || category?.name || 'All products'
  useSeo({ title: q ? `Search: ${q}` : (group || category) ? `${title} — Handcrafted Borosilicate Glass` : 'Shop All Products', description: (group || category) ? `Buy handcrafted borosilicate ${title.toLowerCase()} — ${(group || category).blurb}. Retail, wholesale & export from ${'Ninytasha Exports'}, Delhi.` : undefined, path: cat ? `/shop/${cat}` : '/shop', noindex: !!q, jsonLd: breadcrumbs([['Home', '/'], ['Shop', '/shop'], ...(cat ? [[title, `/shop/${cat}`]] : [])]) })

  const list = useMemo(() => {
    let l = products.filter((p) => {
      if (group && groupOf(p.category) !== group.slug) return false
      if (category && p.category !== category.slug) return false
      return p.price <= max && (pack === 'all' || (pack === 'single' ? p.pack === 1 : p.pack > 1))
    })
    if (q) l = l.filter((p) => (p.name + p.sku + p.description + p.category).toLowerCase().includes(q))
    const s = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, featured: (a, b) => b.featured - a.featured }
    return [...l].sort(s[sort])
  }, [products, group, category, q, sort, max, pack])

  const Filters = (
    <div className="filters">
      <Link className={!cat ? 'on' : ''} to="/shop">All products</Link>
      {GROUPS.map((g) => (
        <div key={g.slug} className="f-group">
          <Link className={'f-g ' + (cat === g.slug ? 'on' : '')} to={`/shop/${g.slug}`}><CatIcon name={g.icon} size={16} /> {g.name}</Link>
          {activeGroup === g.slug && CATEGORIES.filter((c) => c.group === g.slug && c.slug !== g.slug).map((c) => (
            <Link key={c.slug} className={'f-c ' + (cat === c.slug ? 'on' : '')} to={`/shop/${c.slug}`}>{c.name}</Link>
          ))}
        </div>
      ))}
      <h4>Max price: ₹{max.toLocaleString('en-IN')}</h4>
      <input type="range" min={100} max={5000} step={50} value={max} onChange={(e) => setMax(+e.target.value)} />
      <h4>Pack</h4>
      {[['all', 'All'], ['single', 'Single piece'], ['multi', 'Packs & sets']].map(([v, l]) => <label key={v} className="radio"><input type="radio" checked={pack === v} onChange={() => setPack(v)} />{l}</label>)}
    </div>
  )

  const subcats = activeGroup ? CATEGORIES.filter((c) => c.group === activeGroup && c.slug !== activeGroup) : []
  const wa = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Hi ${BRAND.name}, please share your catalogue and prices for ${title}.`)}`

  return (
    <div className="container page">
      <div className="crumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link>{category && GROUPS.find((g) => g.slug === category.group) && <> / <Link to={`/shop/${category.group}`}>{GROUPS.find((g) => g.slug === category.group).name}</Link></>}{(group || category) && <> / {group?.name || category.name}</>}</div>
      <div className="shop-head">
        <div><h1>{title}</h1><p className="muted">{list.length} products{(group || category)?.blurb ? ` · ${(group || category).blurb}` : ''}</p></div>
        <div className="shop-tools">
          <button className="btn outline sm show-m" onClick={() => setOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        </div>
      </div>

      <div className="chips">
        {(subcats.length > 1 ? subcats : GROUPS).map((c) => <Link key={c.slug} to={`/shop/${c.slug}`} className={'chip ' + (cat === c.slug ? 'on' : '')}>{c.name}</Link>)}
      </div>

      <div className="shop-layout">
        <aside className="hide-m">{Filters}</aside>
        <div>
          {loading ? <div className="grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" />)}</div>
            : list.length ? <motion.div layout className="grid">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</motion.div>
            : (
              <motion.div className="coming" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="coming-icon"><CatIcon name={group?.icon} cat={category?.slug} size={34} /></div>
                <h3>{q ? 'Nothing matches that search' : `${title} — catalogue on request`}</h3>
                <p>{q ? 'Try another word, or ask us directly.' : `We make ${title.toLowerCase()} in handcrafted borosilicate glass. Online listings are coming soon — message us for designs, photos and retail or wholesale prices.`}</p>
                <div className="hero-cta center">
                  <a className="btn gold" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp for catalogue</a>
                  <Link className="btn outline" to="/corporate"><FileText size={18} /> Request a quote</Link>
                </div>
              </motion.div>
            )}
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