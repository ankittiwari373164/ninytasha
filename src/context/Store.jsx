import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import * as api from '../lib/api'
import { unitPrice } from '../data/products'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(() => load('r3_cart', []))
  const [wish, setWish] = useState(() => load('r3_wish', []))
  const [user, setUser] = useState(null)
  const [toasts, setToasts] = useState([])

  const refreshProducts = useCallback(() => api.listProducts().then(setProducts).catch(console.error).finally(() => setLoading(false)), [])
  useEffect(() => { refreshProducts(); api.currentUser().then(setUser) }, [refreshProducts])
  useEffect(() => {
    if (!api.supabase) return
    const { data } = api.supabase.auth.onAuthStateChange(() => api.currentUser().then(setUser))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => { try { localStorage.setItem('r3_cart', JSON.stringify(cart)) } catch {} }, [cart])
  useEffect(() => { try { localStorage.setItem('r3_wish', JSON.stringify(wish)) } catch {} }, [wish])

  const toast = useCallback((msg) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  const addToCart = (p, qty = 1, color) => {
    qty = Math.max(qty, p.min_qty || 1)
    setCart((c) => {
      const key = p.id + '|' + (color || '')
      const ex = c.find((i) => i.key === key)
      if (ex) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      return [...c, { key, id: p.id, qty, color }]
    })
    toast(`Added ${p.name} to bag`)
  }
  const setQty = (key, qty) => setCart((c) => c.map((i) => {
    if (i.key !== key) return i
    const p = products.find((x) => x.id === i.id)
    return { ...i, qty: Math.max(p?.min_qty || 1, qty) }
  }))
  const removeItem = (key) => setCart((c) => c.filter((i) => i.key !== key))
  const clearCart = () => setCart([])
  const toggleWish = (id) => setWish((w) => {
    const has = w.includes(id); toast(has ? 'Removed from wishlist' : 'Saved to wishlist')
    return has ? w.filter((x) => x !== id) : [...w, id]
  })

  const lines = useMemo(() => cart.map((i) => {
    const p = products.find((x) => x.id === i.id)
    if (!p) return null
    const price = unitPrice(p, i.qty)
    return { ...i, product: p, price, total: price * i.qty }
  }).filter(Boolean), [cart, products])
  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  const value = { products, loading, refreshProducts, cart, lines, subtotal, count, addToCart, setQty, removeItem, clearCart, wish, toggleWish, user, setUser, toast, toasts }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
