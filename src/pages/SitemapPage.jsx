import { Link } from 'react-router-dom'
import { useStore } from '../context/Store'
import { GROUPS, CATEGORIES } from '../data/products'
import { POLICIES } from './Policies'
import { useSeo } from '../lib/seo'

export default function SitemapPage() {
  const { products } = useStore()
  useSeo({ title: 'Sitemap', description: 'All pages, product categories and products on the Ninytasha Exports website.', path: '/sitemap' })
  return (
    <div className="container page">
      <h1>Sitemap</h1>
      <div className="sitemap-grid">
        <section><h3>Company</h3><Link to="/">Home</Link><Link to="/about">About us</Link><Link to="/contact">Contact us</Link><Link to="/corporate">Wholesale & export</Link><Link to="/faq">FAQs</Link><Link to="/track">Track order</Link></section>
        <section><h3>Policies</h3>{Object.entries(POLICIES).map(([k, v]) => <Link key={k} to={`/${k}`}>{v.title}</Link>)}</section>
        {GROUPS.map((g) => (
          <section key={g.slug}><h3><Link to={`/shop/${g.slug}`}>{g.name}</Link></h3>
            {CATEGORIES.filter((c) => c.group === g.slug).map((c) => <Link key={c.slug} to={`/shop/${c.slug}`}>{c.name}</Link>)}
          </section>
        ))}
        <section className="wide"><h3>Products</h3>{products.map((p) => <Link key={p.id} to={`/product/${p.id}`}>{p.name} <span className="muted">({p.sku})</span></Link>)}</section>
      </div>
    </div>
  )
}
