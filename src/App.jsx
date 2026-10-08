import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Navbar, BottomNav, Footer, Toasts, AnnouncementBar } from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Wishlist from './pages/Wishlist'
import Account from './pages/Account'
import Bulk from './pages/Bulk'
import { About, Contact, FAQ, Policy, NotFound, Track } from './pages/Info'
import Admin from './admin/Admin'

function Page({ children }) {
  return (
    <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.main>
  )
}

export default function App() {
  const loc = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  if (loc.pathname.startsWith('/admin')) return <><Routes><Route path="/admin/*" element={<Admin />} /></Routes><Toasts /></>
  const r = (el) => <Page>{el}</Page>
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname}>
          <Route path="/" element={r(<Home />)} />
          <Route path="/shop" element={r(<Shop />)} />
          <Route path="/shop/:cat" element={r(<Shop />)} />
          <Route path="/product/:id" element={r(<Product />)} />
          <Route path="/cart" element={r(<Cart />)} />
          <Route path="/checkout" element={r(<Checkout />)} />
          <Route path="/order/:no" element={r(<OrderSuccess />)} />
          <Route path="/wishlist" element={r(<Wishlist />)} />
          <Route path="/account" element={r(<Account />)} />
          <Route path="/corporate" element={r(<Bulk />)} />
          <Route path="/about" element={r(<About />)} />
          <Route path="/contact" element={r(<Contact />)} />
          <Route path="/faq" element={r(<FAQ />)} />
          <Route path="/track" element={r(<Track />)} />
          <Route path="/policy/:slug" element={r(<Policy />)} />
          <Route path="*" element={r(<NotFound />)} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <BottomNav />
      <Toasts />
    </>
  )
}
