import { Flame, Coffee, Wine, Soup, Flower2, Gift, Bell, GlassWater, Milk, Sparkles, Martini, Amphora, Package } from 'lucide-react'

const MAP = { Flame, Coffee, Wine, Soup, Flower2, Gift, Bell, GlassWater, Milk, Sparkles, Martini, Amphora, Package }
const CAT_ICON = {
  diyas: 'Flame', 'akhand-jyot': 'Sparkles', bells: 'Bell', 'mugs-cups': 'Coffee', jars: 'Package', 'water-bottles': 'Milk', jugs: 'GlassWater',
  'wine-glasses': 'Wine', 'cocktail-glasses': 'Martini', 'champagne-glasses': 'Wine', tumblers: 'GlassWater', crockery: 'Soup',
  'candle-stands': 'Flame', vases: 'Amphora', 'gift-sets': 'Gift',
  'modak-diyas': 'Flame', 'temple-bells': 'Bell', 'pooja-gift-sets': 'Gift', 'stemmed-glasses': 'Wine', 'cocktail-tumblers': 'GlassWater',
  'candle-holders': 'Flame', 'handicraft-items': 'Sparkles', 'gift-items': 'Gift',
}
export default function CatIcon({ name, cat, size = 22 }) {
  const I = MAP[name || CAT_ICON[cat]] || Sparkles
  return <I size={size} strokeWidth={1.6} />
}
