import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function OrderSuccess() {
  const { no } = useParams()
  const quote = no === 'quote'
  return (
    <div className="container page empty success">
      <motion.div className="tick" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}><Check size={44} /></motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{quote ? 'Quote request sent!' : 'Thank you for your order!'}</motion.h1>
      {quote ? <p>Our team will email a formal quote with GST and shipping within 24 hours.</p>
        : <p>Your order number is <b>{no}</b>. We've sent the details to your email. Keep this number to track your parcel.</p>}
      <div className="hero-cta center">
        {!quote && <Link to="/track" className="btn outline">Track order</Link>}
        <Link to="/shop" className="btn dark">Continue shopping</Link>
      </div>
    </div>
  )
}
