import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '../context/Store'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wish, products } = useStore()
  const list = products.filter((p) => wish.includes(p.id))
  return (
    <div className="container page">
      <h1>Wishlist</h1>
      {list.length ? <div className="grid">{list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
        : <div className="empty"><Heart size={52} strokeWidth={1.2} /><h3>No saved items yet</h3><p>Tap the heart on any product to save it here.</p><Link to="/shop" className="btn dark">Explore</Link></div>}
    </div>
  )
}
