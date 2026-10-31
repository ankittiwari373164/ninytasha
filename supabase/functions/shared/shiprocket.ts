// Shiprocket API client used by the edge functions.
// Secrets: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD (API user from Settings → API),
//          SHIPROCKET_PICKUP_LOCATION (pickup nickname exactly as in Shiprocket),
//          SHIPROCKET_PICKUP_PINCODE, SHIPROCKET_BOX_CM (e.g. 25x20x15, optional)
import { buildShiprocketOrder, parseBox, summariseServiceability, compactScans } from './logic.ts'

const BASE = 'https://apiv2.shiprocket.in/v1/external'
const env = (k: string, d = '') => Deno.env.get(k) || d

export const shiprocketConfigured = () => !!(env('SHIPROCKET_EMAIL') && env('SHIPROCKET_PASSWORD'))

// Token is valid ~10 days; cache it in integration_tokens (service-role only) and refresh after 9 days.
async function getToken(db: any, force = false): Promise<string> {
  if (!force) {
    const { data } = await db.from('integration_tokens').select('token, expires_at').eq('name', 'shiprocket').maybeSingle()
    if (data?.token && new Date(data.expires_at).getTime() > Date.now()) return data.token
  }
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env('SHIPROCKET_EMAIL'), password: env('SHIPROCKET_PASSWORD') }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.token) throw new Error('Shiprocket login failed: ' + (j.message || r.status) + ' — check SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD (use an API user)')
  await db.from('integration_tokens').upsert({ name: 'shiprocket', token: j.token, expires_at: new Date(Date.now() + 9 * 86400e3).toISOString() })
  return j.token
}

async function sr(db: any, path: string, opts: { method?: string; body?: unknown } = {}, retry = true): Promise<any> {
  const token = await getToken(db)
  const r = await fetch(BASE + path, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (r.status === 401 && retry) { await getToken(db, true); return sr(db, path, opts, false) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const detail = j.message || (j.errors ? Object.values(j.errors).flat().join('; ') : '') || `HTTP ${r.status}`
    throw new Error('Shiprocket: ' + detail)
  }
  return j
}

/** Create the order in Shiprocket and store its ids on our order. Safe to call twice (skips if already created). */
export async function createShipment(db: any, order: any) {
  if (order.sr_order_id) return order
  const ids = (order.items || []).map((i: any) => i.id)
  const { data: products } = await db.from('products').select('id, pack, weight').in('id', ids)
  const payload = buildShiprocketOrder(order, products || [], {
    pickupLocation: env('SHIPROCKET_PICKUP_LOCATION', 'Primary'),
    box: parseBox(env('SHIPROCKET_BOX_CM')),
  })
  const j = await sr(db, '/orders/create/adhoc', { body: payload })
  const patch: any = {
    sr_order_id: String(j.order_id ?? ''),
    sr_shipment_id: String(j.shipment_id ?? ''),
    shipping_status: j.status || 'NEW',
  }
  if (j.awb_code) Object.assign(patch, { awb: j.awb_code, tracking: j.awb_code, courier: j.courier_name || null })
  await db.from('orders').update(patch).eq('id', order.id)
  return { ...order, ...patch }
}

/** Assign a courier + AWB (Shiprocket picks the recommended courier unless courier_id is given), request pickup, fetch label. */
export async function shipNow(db: any, order: any, courierId?: number) {
  if (!order.sr_shipment_id) order = await createShipment(db, order)
  const patch: any = {}
  if (!order.awb) {
    const j = await sr(db, '/courier/assign/awb', { body: { shipment_id: Number(order.sr_shipment_id), ...(courierId ? { courier_id: courierId } : {}) } })
    const d = j.response?.data || j.data || {}
    if (!d.awb_code) throw new Error('Shiprocket did not assign an AWB: ' + (j.message || d.awb_assign_error || 'check wallet balance / pickup address'))
    Object.assign(patch, { awb: d.awb_code, tracking: d.awb_code, courier: d.courier_name || null, shipping_status: 'AWB ASSIGNED' })
  }
  try {
    await sr(db, '/courier/generate/pickup', { body: { shipment_id: [Number(order.sr_shipment_id)] } })
    patch.shipping_status = 'PICKUP SCHEDULED'
  } catch (e) { patch.shipping_status = patch.shipping_status || order.shipping_status; patch.pickup_error = String((e as Error).message) }
  try {
    const l = await sr(db, '/courier/generate/label', { body: { shipment_id: [Number(order.sr_shipment_id)] } })
    if (l.label_url) patch.label_url = l.label_url
  } catch { /* label can be fetched later */ }
  const { pickup_error, ...save } = patch
  if (['confirmed', 'pending'].includes(order.status)) save.status = 'packed'
  if (save.awb) save.tracking_url = `https://shiprocket.co/tracking/${save.awb}`
  await db.from('orders').update(save).eq('id', order.id)
  return { ...order, ...save, pickup_error }
}

export async function getLabel(db: any, order: any) {
  const l = await sr(db, '/courier/generate/label', { body: { shipment_id: [Number(order.sr_shipment_id)] } })
  if (l.label_url) await db.from('orders').update({ label_url: l.label_url }).eq('id', order.id)
  return l.label_url
}

export async function cancelShipment(db: any, order: any) {
  if (order.sr_order_id) await sr(db, '/orders/cancel', { body: { ids: [Number(order.sr_order_id)] } })
  await db.from('orders').update({ shipping_status: 'CANCELED' }).eq('id', order.id)
}

export async function trackAwb(db: any, awb: string) {
  const j = await sr(db, `/courier/track/awb/${encodeURIComponent(awb)}`)
  const t = j.tracking_data || j[awb]?.tracking_data || {}
  const st = t.shipment_track?.[0] || {}
  return {
    status: st.current_status || t.shipment_status_label || null,
    etd: t.etd || st.edd || null,
    courier: st.courier_name || null,
    url: t.track_url || `https://shiprocket.co/tracking/${awb}`,
    events: compactScans(t.shipment_track_activities || []),
  }
}

export async function serviceability(db: any, pincode: string, weight = 0.5) {
  const pick = env('SHIPROCKET_PICKUP_PINCODE', '110033')
  const q = (cod: number) => `/courier/serviceability/?pickup_postcode=${pick}&delivery_postcode=${pincode}&weight=${weight}&cod=${cod}`
  const [prepaid, cod] = await Promise.all([sr(db, q(0)).catch(() => ({})), sr(db, q(1)).catch(() => ({}))])
  const a = summariseServiceability(prepaid), b = summariseServiceability(cod)
  return { serviceable: a.serviceable || b.serviceable, days: a.days ?? b.days, cod: b.serviceable }
}
