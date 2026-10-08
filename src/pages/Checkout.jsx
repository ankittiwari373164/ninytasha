import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Banknote, FileText, Tag, Lock } from 'lucide-react'
import { useStore } from '../context/Store'
import { BRAND, inr } from '../lib/config'
import * as api from '../lib/api'

const loadRzp = () => new Promise((res) => {
  if (window.Razorpay) return res(true)
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s)
})

export default function Checkout() {
  const { lines, subtotal, clearCart, user, toast } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', state: '', pincode: '', company: '', gst: '', notes: '' })
  const [method, setMethod] = useState('razorpay')
  const [code, setCode] = useState(''); const [coupon, setCoupon] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (!lines.length) return <div className="container page empty"><h2>Nothing to check out</h2><Link className="btn dark" to="/shop">Shop now</Link></div>

  const discount = coupon ? (coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value) : 0
  const shipping = subtotal >= BRAND.freeShippingAbove ? 0 : BRAND.shippingFee
  const codFee = method === 'cod' ? BRAND.codFee : 0
  const total = Math.max(0, subtotal - discount + shipping + codFee)

  const apply = async () => {
    const c = await api.findCoupon(code)
    if (!c) return toast('Invalid coupon code')
    if (subtotal < (c.min_order || 0)) return toast(`Minimum order ${inr(c.min_order)} for this code`)
    setCoupon(c); toast(`${c.code} applied`)
  }

  const items = lines.map((l) => ({ id: l.id, sku: l.product.sku, name: l.product.name, qty: l.qty, price: l.price, color: l.color || null, image: l.product.images[0] }))
  const base = () => ({ ...f, items, subtotal, discount, shipping: shipping + codFee, total, coupon: coupon?.code || null, user_id: user?.id || null })

  const place = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      if (method === 'quote') {
        await api.createEnquiry({ type: 'quote', name: f.name, email: f.email, phone: f.phone, company: f.company, message: `${f.notes}\n\nAddress: ${f.address}, ${f.city}, ${f.state} ${f.pincode}\nGST: ${f.gst}`, items, estimate: total })
        clearCart(); nav('/order/quote'); return
      }
      if (method === 'cod') {
        const o = await api.createOrder({ ...base(), payment_method: 'cod', payment_status: 'pending', status: 'pending' })
        const msg = `Hi ${BRAND.name}! I placed COD order ${o.order_no} for ${inr(total)}.\n` + items.map((i) => `• ${i.sku} ${i.name} × ${i.qty}`).join('\n') + `\nName: ${f.name}\nAddress: ${f.address}, ${f.city} ${f.pincode}`
        window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
        clearCart(); nav('/order/' + o.order_no); return
      }
      // Razorpay
      if (!(await loadRzp())) throw new Error('Could not load Razorpay. Check your connection.')
      const o = await api.createOrder({ ...base(), payment_method: 'razorpay', payment_status: 'pending', status: 'pending' })
      let rzpOrderId, amount = total * 100
      if (api.isLive) {
        const { data, error } = await api.supabase.functions.invoke('razorpay', { body: { action: 'create', order_id: o.id } })
        if (error) throw error; rzpOrderId = data.id; amount = data.amount
      }
      new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, amount, currency: 'INR', name: BRAND.name, description: `Order ${o.order_no}`, order_id: rzpOrderId,
        prefill: { name: f.name, email: f.email, contact: f.phone }, theme: { color: '#b8862f' },
        handler: async (resp) => {
          if (api.isLive) await api.supabase.functions.invoke('razorpay', { body: { action: 'verify', order_id: o.id, ...resp } })
          else await api.updateOrder(o.id, { payment_status: 'paid', status: 'confirmed', payment_ref: resp.razorpay_payment_id })
          clearCart(); nav('/order/' + o.order_no)
        },
        modal: { ondismiss: () => { setBusy(false); toast('Payment cancelled — your order is saved as pending') } },
      }).open()
    } catch (er) { toast(er.message || 'Something went wrong'); setBusy(false) }
  }

  const methods = [
    ['razorpay', CreditCard, 'Pay online', 'UPI, cards, netbanking, wallets via Razorpay'],
    ['cod', Banknote, 'Cash on delivery', `+${inr(BRAND.codFee)} · confirmed on WhatsApp`],
    ['quote', FileText, 'Request a quote', 'For bulk / GST invoices — we reply within 24h'],
  ]

  return (
    <form className="container page" onSubmit={place}>
      <h1>Checkout</h1>
      <div className="cart-layout">
        <div className="co-forms">
          <section className="panel">
            <h3>Contact</h3>
            <div className="fgrid">
              <input required placeholder="Full name" value={f.name} onChange={set('name')} />
              <input required type="tel" pattern="[0-9+ ]{10,14}" placeholder="Mobile number" value={f.phone} onChange={set('phone')} />
              <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} className="span2" />
            </div>
          </section>
          <section className="panel">
            <h3>Delivery address</h3>
            <div className="fgrid">
              <input required placeholder="House, street, area" value={f.address} onChange={set('address')} className="span2" />
              <input required placeholder="City" value={f.city} onChange={set('city')} />
              <input required placeholder="State" value={f.state} onChange={set('state')} />
              <input required pattern="[0-9]{6}" placeholder="PIN code" value={f.pincode} onChange={set('pincode')} />
              <input placeholder="Company (optional)" value={f.company} onChange={set('company')} />
              <input placeholder="GSTIN (optional)" value={f.gst} onChange={set('gst')} className="span2" />
              <textarea placeholder="Order notes, gift message, branding needs…" value={f.notes} onChange={set('notes')} className="span2" rows={2} />
            </div>
          </section>
          <section className="panel">
            <h3>Payment</h3>
            <div className="methods">
              {methods.map(([v, I, t, d]) => (
                <label key={v} className={'method ' + (method === v ? 'on' : '')}>
                  <input type="radio" name="m" checked={method === v} onChange={() => setMethod(v)} />
                  <I size={22} /><div><b>{t}</b><span>{d}</span></div>
                  {method === v && <motion.span layoutId="m-ring" className="m-ring" />}
                </label>
              ))}
            </div>
          </section>
        </div>
        <aside className="summary">
          <h3>Your order</h3>
          {lines.map((l) => <div key={l.key} className="mini"><img src={l.product.images[0]} alt="" /><div><b>{l.product.name}</b><span>{l.qty} × {inr(l.price)}</span></div><b>{inr(l.total)}</b></div>)}
          <div className="coupon"><Tag size={16} /><input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} /><button type="button" className="btn outline sm" onClick={apply}>Apply</button></div>
          <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
          {discount > 0 && <div className="row green"><span>Discount ({coupon.code})</span><b>−{inr(discount)}</b></div>}
          <div className="row"><span>Shipping</span><b>{shipping ? inr(shipping) : 'Free'}</b></div>
          {codFee > 0 && <div className="row"><span>COD fee</span><b>{inr(codFee)}</b></div>}
          <div className="row total"><span>Total</span><b>{inr(total)}</b></div>
          <button disabled={busy} className="btn dark full">{busy ? 'Processing…' : method === 'quote' ? 'Send quote request' : method === 'cod' ? 'Place COD order' : `Pay ${inr(total)}`}</button>
          <p className="muted small center"><Lock size={12} /> Secure checkout</p>
        </aside>
      </div>
    </form>
  )
}
