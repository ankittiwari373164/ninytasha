import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, Tag, Mail, LogOut, Plus, Pencil, Trash2, X, Upload, Search, Printer, ExternalLink, TrendingUp, IndianRupee, Clock } from 'lucide-react'
import { useStore } from '../context/Store'
import { inr, BRAND } from '../lib/config'
import { CATEGORIES } from '../data/products'
import * as api from '../lib/api'

const NAV = [
  ['/admin', LayoutDashboard, 'Dashboard', true], ['/admin/orders', ShoppingCart, 'Orders'], ['/admin/products', Package, 'Products'],
  ['/admin/enquiries', MessageSquare, 'Enquiries'], ['/admin/customers', Users, 'Customers'], ['/admin/coupons', Tag, 'Coupons'], ['/admin/subscribers', Mail, 'Subscribers'],
]
const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

export default function Admin() {
  const { user, setUser } = useStore()
  if (!user || user.role !== 'admin') return (
    <div className="admin-login"><div className="panel"><Link to="/" className="logo">R3<span>·</span>Admin</Link>{user && <p className="err">Signed in as {user.email}, which is not an admin.</p>}<AdminLogin /></div></div>
  )
  return (
    <div className="admin">
      <aside className="a-side">
        <Link to="/" className="logo light">R3<span>·</span>Admin</Link>
        {NAV.map(([to, I, l, end]) => <NavLink key={to} to={to} end={end} className="a-link"><I size={19} /><span>{l}</span></NavLink>)}
        <div className="a-foot">
          <Link to="/" className="a-link"><ExternalLink size={19} /><span>View store</span></Link>
          <button className="a-link" onClick={async () => { await api.signOut(); setUser(null) }}><LogOut size={19} /><span>Sign out</span></button>
        </div>
      </aside>
      <main className="a-main">
        {!api.isLive && <div className="demo-banner">Demo mode: data is saved in this browser. Add Supabase keys in <code>.env</code> to go live.</div>}
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="subscribers" element={<Subscribers />} />
        </Routes>
      </main>
    </div>
  )
}

function AdminLogin() {
  const { setUser, toast } = useStore()
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const u = await api.adminSignIn(f.email, f.password); setUser(u); toast('Welcome, admin') } catch (er) { setErr(er.message) } finally { setBusy(false) }
  }
  return (
    <form className="auth" onSubmit={submit}>
      <h3>Admin sign in</h3>
      <input required type="email" autoComplete="username" placeholder="Admin email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input required type="password" autoComplete="current-password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      {err && <p className="err">{err}</p>}
      <button disabled={busy} className="btn dark full">{busy ? 'Checking…' : 'Sign in'}</button>
    </form>
  )
}

const Head = ({ title, children }) => <div className="a-head"><h1>{title}</h1><div className="a-actions">{children}</div></div>
const Modal = ({ title, onClose, children, wide }) => (
  <AnimatePresence>
    <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.div className={'modal ' + (wide ? 'wide' : '')} initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <div className="sheet-head"><b>{title}</b><button className="icon-btn" onClick={onClose}><X /></button></div>
      <div className="modal-body">{children}</div>
    </motion.div>
  </AnimatePresence>
)

function Dashboard() {
  const [orders, setOrders] = useState([]); const [enq, setEnq] = useState([]); const { products } = useStore()
  useEffect(() => { api.listOrders().then(setOrders); api.listEnquiries().then(setEnq) }, [])
  const valid = orders.filter((o) => o.status !== 'cancelled')
  const revenue = valid.reduce((s, o) => s + Number(o.total), 0)
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return d.toISOString().slice(0, 10) })
  const byDay = days.map((d) => valid.filter((o) => o.created_at.slice(0, 10) === d).reduce((s, o) => s + Number(o.total), 0))
  const maxD = Math.max(1, ...byDay)
  const top = useMemo(() => {
    const m = {}; valid.forEach((o) => o.items.forEach((i) => { m[i.sku] = (m[i.sku] || { ...i, units: 0, rev: 0 }); m[i.sku].units += i.qty; m[i.sku].rev += i.qty * i.price }))
    return Object.values(m).sort((a, b) => b.rev - a.rev).slice(0, 5)
  }, [orders])
  const low = products.filter((p) => p.stock < 20)
  const kpis = [[IndianRupee, 'Revenue', inr(revenue)], [ShoppingCart, 'Orders', valid.length], [TrendingUp, 'Avg order', inr(valid.length ? Math.round(revenue / valid.length) : 0)], [Clock, 'Pending', orders.filter((o) => o.status === 'pending').length], [MessageSquare, 'New enquiries', enq.filter((e) => e.status === 'new').length]]
  return (
    <>
      <Head title="Dashboard" />
      <div className="kpis">{kpis.map(([I, l, v], i) => <motion.div key={l} className="kpi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}><I size={18} /><span>{l}</span><b>{v}</b></motion.div>)}</div>
      <div className="a-grid">
        <div className="panel">
          <h3>Revenue · last 14 days</h3>
          <div className="bars">{byDay.map((v, i) => <div key={i} className="bar-col" title={`${days[i]}: ${inr(v)}`}><motion.div className="bar" initial={{ height: 0 }} animate={{ height: `${(v / maxD) * 100}%` }} transition={{ delay: i * 0.03, duration: 0.5 }} /><span>{days[i].slice(8)}</span></div>)}</div>
        </div>
        <div className="panel"><h3>Top products</h3>{top.length ? top.map((t) => <div key={t.sku} className="mini"><img src={t.image} alt="" /><div><b>{t.name}</b><span>{t.units} units</span></div><b>{inr(t.rev)}</b></div>) : <p className="muted">No sales yet.</p>}</div>
        <div className="panel"><h3>Recent orders</h3>{orders.slice(0, 6).map((o) => <div key={o.id} className="row"><span>#{o.order_no} · {o.name}</span><span className={'pill ' + o.status}>{o.status}</span><b>{inr(o.total)}</b></div>)}{!orders.length && <p className="muted">No orders yet.</p>}<Link to="/admin/orders" className="link">All orders →</Link></div>
        <div className="panel"><h3>Low stock</h3>{low.length ? low.map((p) => <div key={p.id} className="row"><span>{p.sku} {p.name}</span><b className="err">{p.stock}</b></div>) : <p className="muted">All products well stocked.</p>}</div>
      </div>
    </>
  )
}

function Orders() {
  const [orders, setOrders] = useState([]); const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [sel, setSel] = useState(null)
  const { toast } = useStore()
  const load = () => api.listOrders().then(setOrders)
  useEffect(() => { load() }, [])
  const list = orders.filter((o) => (st === 'all' || o.status === st) && (o.order_no + o.name + o.email + o.phone).toLowerCase().includes(q.toLowerCase()))
  const update = async (patch) => { await api.updateOrder(sel.id, patch); setSel({ ...sel, ...patch }); load(); toast('Order updated') }
  const exportCsv = () => {
    const rows = [['Order', 'Date', 'Name', 'Email', 'Phone', 'City', 'Total', 'Payment', 'Pay status', 'Status'], ...list.map((o) => [o.order_no, o.created_at.slice(0, 10), o.name, o.email, o.phone, o.city, o.total, o.payment_method, o.payment_status, o.status])]
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'orders.csv'; a.click()
  }
  const invoice = (o) => {
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>Invoice ${o.order_no}</title><style>body{font-family:sans-serif;padding:40px;color:#222}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}.r{text-align:right}</style></head><body><h2>${BRAND.legal}</h2><p>${BRAND.address}<br>GSTIN ${BRAND.gstin}</p><h3>Tax Invoice #${o.order_no}</h3><p>Date: ${new Date(o.created_at).toLocaleDateString('en-IN')}<br>Bill to: ${o.name}${o.company ? ', ' + o.company : ''}<br>${o.address}, ${o.city}, ${o.state} ${o.pincode}<br>${o.phone} · ${o.email}${o.gst ? '<br>GSTIN: ' + o.gst : ''}</p><table><tr><th>Item</th><th>Qty</th><th class=r>Rate</th><th class=r>Amount</th></tr>${o.items.map((i) => `<tr><td>${i.sku} ${i.name}${i.color ? ' (' + i.color + ')' : ''}</td><td>${i.qty}</td><td class=r>₹${i.price}</td><td class=r>₹${i.qty * i.price}</td></tr>`).join('')}<tr><td colspan=3 class=r>Subtotal</td><td class=r>₹${o.subtotal}</td></tr>${o.discount ? `<tr><td colspan=3 class=r>Discount</td><td class=r>-₹${o.discount}</td></tr>` : ''}<tr><td colspan=3 class=r>Shipping</td><td class=r>₹${o.shipping}</td></tr><tr><th colspan=3 class=r>Total</th><th class=r>₹${o.total}</th></tr></table><p>Payment: ${o.payment_method.toUpperCase()} (${o.payment_status})</p><script>print()</script></body></html>`)
  }
  return (
    <>
      <Head title="Orders"><button className="btn outline sm" onClick={exportCsv}>Export CSV</button></Head>
      <div className="a-filters"><div className="search"><Search size={16} /><input placeholder="Search order, name, phone…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">{['all', ...STATUSES].map((s) => <button key={s} className={'chip ' + (st === s ? 'on' : '')} onClick={() => setSt(s)}>{s}</button>)}</div></div>
      <div className="table-wrap"><table className="atable">
        <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>{list.map((o) => <tr key={o.id} onClick={() => setSel(o)} className="click"><td><b>#{o.order_no}</b></td><td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td><td>{o.name}<br /><small className="muted">{o.city}</small></td><td>{o.items.reduce((s, i) => s + i.qty, 0)}</td><td>{inr(o.total)}</td><td><small>{o.payment_method}</small><br /><span className={'pill ' + o.payment_status}>{o.payment_status}</span></td><td><span className={'pill ' + o.status}>{o.status}</span></td></tr>)}</tbody>
      </table>{!list.length && <p className="muted pad">No orders found.</p>}</div>
      {sel && <Modal title={`Order #${sel.order_no}`} onClose={() => setSel(null)} wide>
        <div className="a-grid">
          <div><h4>Customer</h4><p>{sel.name}{sel.company && ` · ${sel.company}`}<br />{sel.email}<br />{sel.phone}</p><h4>Ship to</h4><p>{sel.address}<br />{sel.city}, {sel.state} {sel.pincode}</p>{sel.gst && <p>GSTIN: {sel.gst}</p>}{sel.notes && <><h4>Notes</h4><p>{sel.notes}</p></>}</div>
          <div><h4>Items</h4>{sel.items.map((i, k) => <div key={k} className="mini"><img src={i.image} alt="" /><div><b>{i.name}</b><span>{i.sku}{i.color && ` · ${i.color}`} · {i.qty} × {inr(i.price)}</span></div><b>{inr(i.qty * i.price)}</b></div>)}
            <div className="row"><span>Subtotal</span><b>{inr(sel.subtotal)}</b></div>{sel.discount > 0 && <div className="row"><span>Discount {sel.coupon}</span><b>−{inr(sel.discount)}</b></div>}<div className="row"><span>Shipping/fees</span><b>{inr(sel.shipping)}</b></div><div className="row total"><span>Total</span><b>{inr(sel.total)}</b></div></div>
        </div>
        <div className="fgrid">
          <label className="lbl">Order status<select value={sel.status} onChange={(e) => update({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="lbl">Payment status<select value={sel.payment_status} onChange={(e) => update({ payment_status: e.target.value })}>{['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="lbl span2">Courier tracking no.<input defaultValue={sel.tracking || ''} onBlur={(e) => e.target.value !== (sel.tracking || '') && update({ tracking: e.target.value })} placeholder="e.g. Delhivery 1234567890" /></label>
        </div>
        <div className="a-actions"><button className="btn outline sm" onClick={() => invoice(sel)}><Printer size={15} /> Invoice</button><a className="btn outline sm" target="_blank" rel="noreferrer" href={`https://wa.me/${String(sel.phone).replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}?text=${encodeURIComponent(`Hi ${sel.name}, your ${BRAND.name} order #${sel.order_no} is now ${sel.status}.${sel.tracking ? ' Tracking: ' + sel.tracking : ''}`)}`}>WhatsApp customer</a></div>
      </Modal>}
    </>
  )
}

const EMPTY = { id: '', sku: '', name: '', category: 'modak-diyas', price: 0, mrp: 0, pack: 1, stock: 100, min_qty: 1, images: [], colors: [], description: '', active: true, featured: false, tiers: null, rating: 5, reviews: 0 }
function Products() {
  const { refreshProducts, toast } = useStore()
  const [list, setList] = useState([]); const [ed, setEd] = useState(null); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false)
  const load = () => api.listProducts({ all: true }).then(setList)
  useEffect(() => { load() }, [])
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const p = { ...ed, id: ed.id || ed.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'), price: +ed.price, mrp: +ed.mrp, pack: +ed.pack, stock: +ed.stock, min_qty: +ed.min_qty }
      await api.saveProduct(p); toast('Product saved'); setEd(null); load(); refreshProducts()
    } catch (er) { toast(er.message) } finally { setBusy(false) }
  }
  const del = async (p) => { if (!confirm(`Delete ${p.name}?`)) return; await api.deleteProduct(p.id); load(); refreshProducts(); toast('Deleted') }
  const upload = async (e) => { setBusy(true); try { const urls = await Promise.all([...e.target.files].map(api.uploadImage)); setEd((d) => ({ ...d, images: [...d.images, ...urls] })) } catch (er) { toast(er.message) } setBusy(false) }
  const set = (k) => (e) => setEd({ ...ed, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const shown = list.filter((p) => (p.name + p.sku).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <Head title="Products"><button className="btn dark sm" onClick={() => setEd({ ...EMPTY })}><Plus size={16} /> Add product</button></Head>
      <div className="a-filters"><div className="search"><Search size={16} /><input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="table-wrap"><table className="atable">
        <thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>{shown.map((p) => <tr key={p.id}><td><img className="timg" src={p.images?.[0]} alt="" /></td><td><b>{p.name}</b><br /><small className="muted">{p.sku}</small></td><td>{CATEGORIES.find((c) => c.slug === p.category)?.name}</td><td>{inr(p.price)}{p.tiers && <small className="muted"> tiered</small>}</td><td className={p.stock < 20 ? 'err' : ''}>{p.stock}</td><td><span className={'pill ' + (p.active ? 'delivered' : 'cancelled')}>{p.active ? 'active' : 'hidden'}</span></td><td className="nowrap"><button className="icon-btn" onClick={() => setEd({ ...EMPTY, ...p })}><Pencil size={16} /></button><button className="icon-btn" onClick={() => del(p)}><Trash2 size={16} /></button></td></tr>)}</tbody>
      </table></div>
      {ed && <Modal title={ed.id ? 'Edit product' : 'New product'} onClose={() => setEd(null)} wide>
        <form className="fgrid" onSubmit={save}>
          <label className="lbl">SKU<input required value={ed.sku} onChange={set('sku')} /></label>
          <label className="lbl">Category<select value={ed.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className="lbl span2">Name<input required value={ed.name} onChange={set('name')} /></label>
          <label className="lbl">Price (₹)<input type="number" required value={ed.price} onChange={set('price')} /></label>
          <label className="lbl">MRP (₹)<input type="number" value={ed.mrp} onChange={set('mrp')} /></label>
          <label className="lbl">Pieces in pack<input type="number" value={ed.pack} onChange={set('pack')} /></label>
          <label className="lbl">Stock<input type="number" value={ed.stock} onChange={set('stock')} /></label>
          <label className="lbl">Min order qty<input type="number" value={ed.min_qty} onChange={set('min_qty')} /></label>
          <label className="lbl">Colours (comma separated)<input value={(ed.colors || []).join(', ')} onChange={(e) => setEd({ ...ed, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>
          <label className="lbl span2">Bulk tiers (min:price, e.g. 100:105, 500:95, 1000:85 — leave empty for retail)
            <input value={(ed.tiers || []).map((t) => `${t.min}:${t.price}`).join(', ')} onChange={(e) => { const t = e.target.value.split(',').map((s) => s.split(':').map((n) => +n.trim())).filter(([a, b]) => a && b).map(([min, price]) => ({ min, price })); setEd({ ...ed, tiers: t.length ? t : null }) }} /></label>
          <label className="lbl span2">Description<textarea rows={4} value={ed.description} onChange={set('description')} /></label>
          <div className="span2"><b className="small">Images</b>
            <div className="img-edit">{ed.images.map((s, i) => <div key={i}><img src={s} alt="" /><button type="button" onClick={() => setEd({ ...ed, images: ed.images.filter((_, k) => k !== i) })}><X size={14} /></button></div>)}
              <label className="upl"><Upload size={20} /><span>Upload</span><input type="file" accept="image/*" multiple hidden onChange={upload} /></label></div></div>
          <label className="check"><input type="checkbox" checked={ed.active} onChange={set('active')} /> Visible in store</label>
          <label className="check"><input type="checkbox" checked={ed.featured} onChange={set('featured')} /> Featured on home</label>
          <button disabled={busy} className="btn dark span2">{busy ? 'Saving…' : 'Save product'}</button>
        </form>
      </Modal>}
    </>
  )
}

function Enquiries() {
  const [list, setList] = useState([]); const [sel, setSel] = useState(null)
  const load = () => api.listEnquiries().then(setList)
  useEffect(() => { load() }, [])
  const setStatus = async (e, status) => { await api.updateEnquiry(e.id, { status }); load(); setSel({ ...e, status }) }
  return (
    <>
      <Head title="Enquiries & quotes" />
      <div className="table-wrap"><table className="atable">
        <thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Company</th><th>Contact</th><th>Status</th></tr></thead>
        <tbody>{list.map((e) => <tr key={e.id} className="click" onClick={() => setSel(e)}><td>{new Date(e.created_at).toLocaleDateString('en-IN')}</td><td><span className="pill">{e.type}</span></td><td>{e.name}</td><td>{e.company}</td><td>{e.email}<br /><small>{e.phone}</small></td><td><span className={'pill ' + (e.status === 'new' ? 'pending' : e.status === 'won' ? 'delivered' : 'confirmed')}>{e.status}</span></td></tr>)}</tbody>
      </table>{!list.length && <p className="muted pad">No enquiries yet.</p>}</div>
      {sel && <Modal title={`${sel.type} from ${sel.name}`} onClose={() => setSel(null)}>
        <p><b>{sel.company}</b><br />{sel.email} · {sel.phone}</p>
        <pre className="msg">{sel.message}</pre>
        {sel.items && <>{sel.items.map((i, k) => <div className="row" key={k}><span>{i.sku} × {i.qty}</span><b>{inr(i.qty * i.price)}</b></div>)}<div className="row total"><span>Estimate</span><b>{inr(sel.estimate)}</b></div></>}
        <div className="chips">{['new', 'contacted', 'quoted', 'won', 'lost'].map((s) => <button key={s} className={'chip ' + (sel.status === s ? 'on' : '')} onClick={() => setStatus(sel, s)}>{s}</button>)}</div>
        <div className="a-actions"><a className="btn dark sm" href={`mailto:${sel.email}?subject=${encodeURIComponent('Your quote from ' + BRAND.name)}`}>Reply by email</a></div>
      </Modal>}
    </>
  )
}

function Customers() {
  const [list, setList] = useState([])
  useEffect(() => { api.listCustomers().then(setList) }, [])
  return (
    <>
      <Head title="Customers" />
      <div className="table-wrap"><table className="atable"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spent</th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.email}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.orders}</td><td>{inr(c.spent)}</td></tr>)}</tbody></table>{!list.length && <p className="muted pad">No customers yet.</p>}</div>
    </>
  )
}

function Coupons() {
  const [list, setList] = useState([]); const [f, setF] = useState({ code: '', type: 'percent', value: 10, min_order: 0, active: true }); const { toast } = useStore()
  const load = () => api.listCoupons().then(setList)
  useEffect(() => { load() }, [])
  const add = async (e) => { e.preventDefault(); await api.saveCoupon({ ...f, code: f.code.toUpperCase(), value: +f.value, min_order: +f.min_order }); setF({ ...f, code: '' }); load(); toast('Coupon saved') }
  return (
    <>
      <Head title="Coupons" />
      <form className="panel fgrid four" onSubmit={add}>
        <input required placeholder="CODE" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">% off</option><option value="flat">₹ off</option></select>
        <input type="number" placeholder="Value" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        <input type="number" placeholder="Min order ₹" value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} />
        <button className="btn dark"><Plus size={16} /> Add</button>
      </form>
      <div className="table-wrap"><table className="atable"><thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Active</th><th></th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.id}><td><b>{c.code}</b></td><td>{c.type === 'percent' ? c.value + '%' : inr(c.value)}</td><td>{inr(c.min_order)}</td><td><input type="checkbox" checked={c.active} onChange={async () => { await api.saveCoupon({ ...c, active: !c.active }); load() }} /></td><td><button className="icon-btn" onClick={async () => { await api.deleteCoupon(c.id); load() }}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
    </>
  )
}

function Subscribers() {
  const [list, setList] = useState([])
  useEffect(() => { api.listSubscribers().then(setList) }, [])
  return <><Head title="Newsletter subscribers"><button className="btn outline sm" onClick={() => navigator.clipboard.writeText(list.map((s) => s.email).join(', '))}>Copy all emails</button></Head>
    <div className="table-wrap"><table className="atable"><thead><tr><th>Email</th><th>Joined</th></tr></thead><tbody>{list.map((s) => <tr key={s.email}><td>{s.email}</td><td>{s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '—'}</td></tr>)}</tbody></table>{!list.length && <p className="muted pad">No subscribers yet.</p>}</div></>
}
