import { createClient } from '@supabase/supabase-js'
import { PRODUCTS, CATEGORIES } from '../data/products'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null
export const isLive = !!supabase

// ---------- local demo store (used only when Supabase env vars are missing) ----------
const L = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('r3_' + k)) ?? d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem('r3_' + k, JSON.stringify(v)) } catch {} },
}
const localProducts = () => L.get('products', PRODUCTS)
const uid = () => Math.random().toString(36).slice(2, 10)
const must = ({ data, error }) => { if (error) throw error; return data }

// ---------- products ----------
export async function listProducts({ all = false } = {}) {
  if (!supabase) return localProducts().filter((p) => all || p.active)
  let q = supabase.from('products').select('*').order('created_at')
  if (!all) q = q.eq('active', true)
  return must(await q)
}
export async function getProduct(id) {
  if (!supabase) return localProducts().find((p) => p.id === id)
  return must(await supabase.from('products').select('*').eq('id', id).maybeSingle())
}
export async function saveProduct(p) {
  if (!supabase) {
    const list = localProducts(); const i = list.findIndex((x) => x.id === p.id)
    if (i >= 0) list[i] = p; else list.push({ ...p, id: p.id || uid() })
    L.set('products', list); return p
  }
  return must(await supabase.from('products').upsert(p).select().single())
}
export async function deleteProduct(id) {
  if (!supabase) return L.set('products', localProducts().filter((p) => p.id !== id))
  must(await supabase.from('products').delete().eq('id', id))
}
export async function uploadImage(file) {
  if (!supabase) return new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file) })
  const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`
  must(await supabase.storage.from('product-images').upload(path, file))
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}
export const listCategories = async () => CATEGORIES

// ---------- reviews ----------
export async function listReviews(productId) {
  if (!supabase) return L.get('reviews', []).filter((r) => r.product_id === productId)
  return must(await supabase.from('reviews').select('*').eq('product_id', productId).eq('approved', true).order('created_at', { ascending: false }))
}
export async function addReview(r) {
  if (!supabase) { L.set('reviews', [{ ...r, id: uid(), created_at: new Date().toISOString() }, ...L.get('reviews', [])]); return }
  must(await supabase.from('reviews').insert(r))
}

// ---------- orders ----------
export async function createOrder(order) {
  // id generated client-side so guests never need SELECT access to the orders table
  const o = { ...order, id: crypto.randomUUID(), order_no: 'R3' + Date.now().toString().slice(-8), created_at: new Date().toISOString() }
  if (!supabase) { L.set('orders', [o, ...L.get('orders', [])]); return o }
  must(await supabase.from('orders').insert(o))
  return o
}
export async function listOrders({ email } = {}) {
  if (!supabase) return L.get('orders', []).filter((o) => !email || o.email === email)
  let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (email) q = q.eq('email', email)
  return must(await q)
}
export async function trackOrder(orderNo, phone) {
  if (!supabase) return L.get('orders', []).find((o) => o.order_no === orderNo && o.phone === phone)
  return must(await supabase.rpc('track_order', { p_order_no: orderNo, p_phone: phone }))?.[0]
}
export async function updateOrder(id, patch) {
  if (!supabase) return L.set('orders', L.get('orders', []).map((o) => (o.id === id ? { ...o, ...patch } : o)))
  must(await supabase.from('orders').update(patch).eq('id', id))
}

// ---------- enquiries (bulk quotes + contact) ----------
export async function createEnquiry(e) {
  const row = { ...e, status: 'new', created_at: new Date().toISOString() }
  if (!supabase) { L.set('enquiries', [{ ...row, id: uid() }, ...L.get('enquiries', [])]); return }
  must(await supabase.from('enquiries').insert(row))
}
export async function listEnquiries() {
  if (!supabase) return L.get('enquiries', [])
  return must(await supabase.from('enquiries').select('*').order('created_at', { ascending: false }))
}
export async function updateEnquiry(id, patch) {
  if (!supabase) return L.set('enquiries', L.get('enquiries', []).map((o) => (o.id === id ? { ...o, ...patch } : o)))
  must(await supabase.from('enquiries').update(patch).eq('id', id))
}

// ---------- coupons ----------
const DEMO_COUPONS = [{ id: 'c1', code: 'DIWALI10', type: 'percent', value: 10, min_order: 499, active: true }]
export async function listCoupons() {
  if (!supabase) return L.get('coupons', DEMO_COUPONS)
  return must(await supabase.from('coupons').select('*').order('created_at'))
}
export async function saveCoupon(c) {
  if (!supabase) { const l = L.get('coupons', DEMO_COUPONS).filter((x) => x.id !== c.id); L.set('coupons', [...l, { ...c, id: c.id || uid() }]); return }
  must(await supabase.from('coupons').upsert(c))
}
export async function deleteCoupon(id) {
  if (!supabase) return L.set('coupons', L.get('coupons', DEMO_COUPONS).filter((x) => x.id !== id))
  must(await supabase.from('coupons').delete().eq('id', id))
}
export async function findCoupon(code) {
  const list = supabase ? must(await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('active', true)) : L.get('coupons', DEMO_COUPONS)
  return list.find((c) => c.code === code.toUpperCase() && c.active)
}

// ---------- newsletter ----------
export async function subscribe(email) {
  if (!supabase) return L.set('subs', [...L.get('subs', []), email])
  const { error } = await supabase.from('subscribers').insert({ email })
  if (error && error.code !== '23505') throw error
}
export async function listSubscribers() {
  if (!supabase) return L.get('subs', []).map((email) => ({ email }))
  return must(await supabase.from('subscribers').select('*').order('created_at', { ascending: false }))
}

// ---------- customers ----------
export async function listCustomers() {
  if (!supabase) {
    const m = {}; L.get('orders', []).forEach((o) => { const c = (m[o.email] ||= { email: o.email, name: o.name, phone: o.phone, orders: 0, spent: 0 }); c.orders++; c.spent += o.total })
    return Object.values(m)
  }
  return must(await supabase.from('customer_summary').select('*'))
}

// ---------- auth ----------
// Demo mode only (no Supabase): these VITE_ vars end up in the browser bundle, so never
// put your real admin password here. In live mode the admin password is a server secret.
const DEMO_ADMIN = { email: import.meta.env.VITE_DEMO_ADMIN_EMAIL, password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD }
export async function signIn(email, password) {
  if (!supabase) {
    const users = L.get('users', [])
    const u = DEMO_ADMIN.email && DEMO_ADMIN.password && email === DEMO_ADMIN.email && password === DEMO_ADMIN.password ? { email, name: 'Admin', role: 'admin' } : users.find((x) => x.email === email && x.password === password)
    if (!u) throw new Error('Invalid email or password')
    L.set('session', u); return u
  }
  must(await supabase.auth.signInWithPassword({ email, password }))
  return currentUser()
}
export async function signUp(name, email, password) {
  if (!supabase) {
    const u = { name, email, password, role: 'customer' }
    L.set('users', [...L.get('users', []), u]); L.set('session', u); return u
  }
  must(await supabase.auth.signUp({ email, password, options: { data: { name } } }))
  return currentUser()
}
// Admin sign-in: the edge function checks ADMIN_EMAIL / ADMIN_PASSWORD secrets server-side
export async function adminSignIn(email, password) {
  if (!supabase) {
    if (!DEMO_ADMIN.email) throw new Error('Set VITE_DEMO_ADMIN_EMAIL and VITE_DEMO_ADMIN_PASSWORD in .env for demo mode')
    return signIn(email, password)
  }
  const { data, error } = await supabase.functions.invoke('admin-login', { body: { email, password } })
  if (error) {
    let msg = 'Admin login failed'
    try { msg = (await error.context.json()).error || msg } catch {}
    throw new Error(msg)
  }
  if (!data?.ok) throw new Error('Admin login failed')
  must(await supabase.auth.signInWithPassword({ email, password }))
  // fetch a fresh token so the admin claim is present
  await supabase.auth.refreshSession()
  return currentUser()
}
export async function signOut() { if (!supabase) return L.set('session', null); await supabase.auth.signOut() }
export async function currentUser() {
  if (!supabase) return L.get('session', null)
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
  return { id: data.user.id, email: data.user.email, name: prof?.name || data.user.user_metadata?.name, role: data.user.app_metadata?.role === 'admin' ? 'admin' : 'customer' }
}
