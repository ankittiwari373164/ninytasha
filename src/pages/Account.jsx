import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Heart, MapPin, LogOut, Shield, HelpCircle } from 'lucide-react'
import { useStore } from '../context/Store'
import { inr } from '../lib/config'
import * as api from '../lib/api'

export function AuthForm({ onDone }) {
  const { setUser, toast } = useStore()
  const [mode, setMode] = useState('in')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try {
      const u = mode === 'in' ? await api.signIn(f.email, f.password) : await api.signUp(f.name, f.email, f.password)
      setUser(u); toast(mode === 'in' ? 'Welcome back!' : 'Account created'); onDone?.(u)
    } catch (er) { setErr(er.message) }
  }
  return (
    <div className="auth">
      <div className="tabs">{[['in', 'Sign in'], ['up', 'Create account']].map(([v, l]) => <button key={v} className={mode === v ? 'on' : ''} onClick={() => setMode(v)}>{l}{mode === v && <motion.span layoutId="tab-u" className="tab-u" />}</button>)}</div>
      <form onSubmit={submit}>
        <AnimatePresence>{mode === 'up' && <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</AnimatePresence>
        <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={6} placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="err">{err}</p>}
        <button className="btn dark full">{mode === 'in' ? 'Sign in' : 'Create account'}</button>
      </form>
    </div>
  )
}

const STATUS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']

export default function Account() {
  const { user, setUser, wish } = useStore()
  const [orders, setOrders] = useState([])
  useEffect(() => { if (user) api.listOrders({ email: user.email }).then(setOrders).catch(() => {}) }, [user])

  if (!user) return <div className="container page narrow"><h1 className="center">My account</h1><AuthForm /></div>

  return (
    <div className="container page">
      <div className="acct-head">
        <div className="avatar">{(user.name || user.email)[0].toUpperCase()}</div>
        <div><h1>Hi, {user.name || 'there'}</h1><p className="muted">{user.email}</p></div>
      </div>
      <div className="acct-tiles">
        <div className="tile"><Package /><b>{orders.length}</b><span>Orders</span></div>
        <Link to="/wishlist" className="tile"><Heart /><b>{wish.length}</b><span>Saved</span></Link>
        <Link to="/track" className="tile"><MapPin /><b>Track</b><span>Shipment</span></Link>
        <Link to="/faq" className="tile"><HelpCircle /><b>Help</b><span>FAQs</span></Link>
        {user.role === 'admin' && <Link to="/admin" className="tile gold"><Shield /><b>Admin</b><span>Dashboard</span></Link>}
      </div>
      <h2>Order history</h2>
      {!orders.length && <p className="muted">No orders yet.</p>}
      <div className="orders">
        {orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="oc-head"><b>#{o.order_no}</b><span className={'pill ' + o.status}>{o.status}</span></div>
            <p className="muted small">{new Date(o.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {o.items.length} items · {inr(o.total)} · {o.payment_method.toUpperCase()}</p>
            <div className="progress">{STATUS.map((s, i) => <span key={s} className={STATUS.indexOf(o.status) >= i ? 'on' : ''} />)}</div>
            <div className="oc-imgs">{o.items.slice(0, 4).map((i, k) => <img key={k} src={i.image} alt="" />)}</div>
          </div>
        ))}
      </div>
      <button className="btn outline" onClick={async () => { await api.signOut(); setUser(null) }}><LogOut size={16} /> Sign out</button>
    </div>
  )
}
