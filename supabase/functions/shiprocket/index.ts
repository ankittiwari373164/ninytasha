// Shiprocket actions for the store.
// Deploy:  npx supabase functions deploy shiprocket --no-verify-jwt
//
// Public (customers):  serviceability {pincode, weight?}   ·   track {order_no, phone}
// Admin only:          create {order_id} · ship {order_id, courier_id?} · label {order_id} · sync {order_id} · cancel {order_id}
import { createClient } from 'npm:@supabase/supabase-js@2'
import { createShipment, shipNow, getLabel, cancelShipment, trackAwb, serviceability, shiprocketConfigured } from '../_shared/shiprocket.ts'
import { mapShipStatus, advanceStatus, digits10 } from '../_shared/logic.ts'
import { cors, json } from '../_shared/http.ts'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

async function isAdmin(req: Request) {
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return false
  const { data } = await db.auth.getUser(jwt)
  return data?.user?.app_metadata?.role === 'admin'
}

async function syncTracking(order: any) {
  if (!order.awb) return order
  const t = await trackAwb(db, order.awb)
  const patch: any = { tracking_events: t.events, tracking_url: t.url }
  if (t.status) { patch.shipping_status = t.status; patch.status = advanceStatus(order.status, mapShipStatus(t.status)) }
  if (t.etd) patch.etd = t.etd
  if (t.courier) patch.courier = t.courier
  await db.from('orders').update(patch).eq('id', order.id)
  return { ...order, ...patch }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()
    if (!shiprocketConfigured()) return json({ error: 'Shiprocket is not set up yet (missing SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD secrets)' }, 503)

    // ---------- public ----------
    if (body.action === 'serviceability') {
      const pin = String(body.pincode || '')
      if (!/^\d{6}$/.test(pin)) return json({ error: 'Enter a 6-digit PIN code' }, 400)
      const w = Math.min(30, Math.max(0.5, Number(body.weight) || 0.5))
      return json(await serviceability(db, pin, w))
    }
    if (body.action === 'track') {
      const { data: order } = await db.from('orders').select('*').eq('order_no', String(body.order_no || '').trim()).maybeSingle()
      if (!order || digits10(order.phone) !== digits10(body.phone) || digits10(body.phone).length < 10) return json({ error: 'No order found with those details' }, 404)
      let o = order
      if (o.awb) { try { o = await syncTracking(o) } catch { /* show last known */ } }
      return json({ order_no: o.order_no, status: o.status, total: o.total, created_at: o.created_at, awb: o.awb, courier: o.courier, etd: o.etd, tracking_url: o.tracking_url, shipping_status: o.shipping_status, events: o.tracking_events || [] })
    }

    // ---------- admin ----------
    if (!(await isAdmin(req))) return json({ error: 'Admin only' }, 403)
    const { data: order } = await db.from('orders').select('*').eq('id', body.order_id).maybeSingle()
    if (!order) return json({ error: 'Order not found' }, 404)
    if (['create', 'ship'].includes(body.action) && order.payment_method !== 'cod' && order.payment_status !== 'paid')
      return json({ error: 'This online order is not paid yet — it cannot be shipped' }, 400)

    let out: any
    switch (body.action) {
      case 'create': out = await createShipment(db, order); break
      case 'ship': out = await shipNow(db, order, body.courier_id ? Number(body.courier_id) : undefined); break
      case 'label': out = { ...order, label_url: await getLabel(db, order) }; break
      case 'sync': out = await syncTracking(order); break
      case 'cancel': await cancelShipment(db, order); out = { ...order, shipping_status: 'CANCELED' }; break
      default: return json({ error: 'Unknown action' }, 400)
    }
    const { data: fresh } = await db.from('orders').select('*').eq('id', order.id).single()
    return json({ ok: true, order: fresh, warning: out?.pickup_error || null })
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500)
  }
})
