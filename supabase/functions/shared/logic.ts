// Pure helpers shared by the edge functions (no network, no Supabase) — unit-testable.

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Constant-time string comparison
export function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(String(a || '')), y = new TextEncoder().encode(String(b || ''))
  let d = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return d === 0
}

// ---------- order status from Shiprocket status text ----------
const RANK: Record<string, number> = { pending: 0, confirmed: 1, packed: 2, shipped: 3, delivered: 4, cancelled: 5 }

/** Map a Shiprocket status label (e.g. "IN TRANSIT", "DELIVERED") to our order status, or null to leave it unchanged. */
export function mapShipStatus(label: string | null | undefined): string | null {
  const s = String(label || '').toUpperCase()
  if (!s) return null
  if (s.includes('RTO')) return null // returns are tracked in shipping_status only
  if (s.includes('CANCEL')) return null // shipment cancelled — admin decides the order status
  if (s.includes('DELIVERED')) return 'delivered'
  if (/PICKED UP|IN TRANSIT|OUT FOR DELIVERY|SHIPPED|REACHED|DESTINATION|DISPATCH|UNDELIVERED|DELAYED|OUT FOR PICKUP/.test(s)) return 'shipped'
  if (/AWB ASSIGNED|PICKUP SCHEDULED|PICKUP GENERATED|PICKUP QUEUED|MANIFEST|LABEL GENERATED|READY TO SHIP|NEW/.test(s)) return 'packed'
  return null
}

/** Only ever move an order forward (never e.g. delivered → shipped). */
export function advanceStatus(current: string, next: string | null): string {
  if (!next) return current
  if (current === 'cancelled') return current
  return (RANK[next] ?? -1) > (RANK[current] ?? -1) ? next : current
}

// ---------- Shiprocket order payload ----------
export type Box = { length: number; breadth: number; height: number }
export function parseBox(s: string | undefined | null): Box {
  const [l, b, h] = String(s || '25x20x15').toLowerCase().split('x').map((n) => Number(n) || 0)
  return { length: l || 25, breadth: b || 20, height: h || 15 }
}

/** Shiprocket wants "YYYY-MM-DD HH:mm" — we send India time. */
export function istDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

export const digits10 = (p: string) => String(p || '').replace(/\D/g, '').slice(-10)

export function splitName(name: string): { first: string; last: string } {
  const parts = String(name || 'Customer').trim().split(/\s+/)
  return { first: parts[0] || 'Customer', last: parts.slice(1).join(' ') || '.' }
}

/** Weight (kg) of an order: product.weight per unit as sold, else 0.35 kg per piece in the pack. Minimum 0.5 kg. */
export function orderWeight(items: any[], products: any[]): number {
  let w = 0
  for (const i of items) {
    const p = products.find((x) => x.id === i.id) || {}
    const unit = Number(p.weight) > 0 ? Number(p.weight) : 0.35 * Math.max(1, Number(p.pack) || 1)
    w += unit * (Number(i.qty) || 1)
  }
  return Math.max(0.5, Math.round(w * 100) / 100)
}

export function buildShiprocketOrder(order: any, products: any[], cfg: { pickupLocation: string; box: Box }) {
  const { first, last } = splitName(order.name)
  const isCod = order.payment_method === 'cod'
  return {
    order_id: order.order_no,
    order_date: istDate(order.created_at || new Date().toISOString()),
    pickup_location: cfg.pickupLocation,
    comment: order.notes || '',
    billing_customer_name: first,
    billing_last_name: last,
    billing_address: order.address,
    billing_city: order.city,
    billing_pincode: String(order.pincode),
    billing_state: order.state,
    billing_country: 'India',
    billing_email: order.email,
    billing_phone: digits10(order.phone),
    ...(order.company ? { company_name: order.company } : {}),
    shipping_is_billing: true,
    order_items: (order.items || []).map((i: any) => ({
      name: (i.name + (i.color ? ` (${i.color})` : '')).slice(0, 95),
      sku: i.sku,
      units: Number(i.qty),
      selling_price: Number(i.price),
      hsn: '7013', // HSN for glassware (table, kitchen, décor)
    })),
    payment_method: isCod ? 'COD' : 'Prepaid',
    shipping_charges: Number(order.shipping) || 0,
    total_discount: Number(order.discount) || 0,
    sub_total: Number(order.subtotal) || (order.items || []).reduce((s: number, i: any) => s + i.price * i.qty, 0),
    length: cfg.box.length,
    breadth: cfg.box.breadth,
    height: cfg.box.height,
    weight: orderWeight(order.items || [], products),
  }
}

/** Summarise a Shiprocket courier-serviceability response. */
export function summariseServiceability(data: any) {
  const list: any[] = data?.data?.available_courier_companies || []
  if (!list.length) return { serviceable: false, days: null, cod: false }
  const days = list.map((c) => Number(c.estimated_delivery_days)).filter((n) => n > 0)
  return { serviceable: true, days: days.length ? Math.min(...days) : null, cod: list.some((c) => Number(c.cod) === 1) }
}

/** Compact tracking events from a Shiprocket track response or webhook scans. */
export function compactScans(scans: any[] = []) {
  return scans.slice(0, 40).map((s) => ({
    date: s.date || s['date'] || '',
    status: s['sr-status-label'] || s.status || s['sr-status'] || '',
    activity: s.activity || '',
    location: s.location || '',
  }))
}
