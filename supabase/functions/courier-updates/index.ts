// Shiprocket tracking webhook → updates order status, courier and tracking history automatically.
// (Named "courier-updates" because Shiprocket rejects webhook URLs containing "shiprocket", "sr" or "kr".)
// Deploy:  npx supabase functions deploy courier-updates --no-verify-jwt
// Shiprocket → Settings → API → Webhooks:
//   URL:   https://<project-ref>.supabase.co/functions/v1/courier-updates
//   Token: any long random text → also set it as SHIPROCKET_WEBHOOK_TOKEN
import { createClient } from 'npm:@supabase/supabase-js@2'
import { mapShipStatus, advanceStatus, compactScans, safeEqual } from '../_shared/logic.ts'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const TOKEN = Deno.env.get('SHIPROCKET_WEBHOOK_TOKEN') || ''
const ok = (m = 'ok') => new Response(m, { status: 200 }) // Shiprocket only accepts 200

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok()
  if (TOKEN && !safeEqual(req.headers.get('x-api-key') || '', TOKEN)) return new Response('unauthorised', { status: 401 })
  try {
    const p = await req.json()
    let order = null
    if (p.awb) order = (await db.from('orders').select('*').eq('awb', String(p.awb)).maybeSingle()).data
    if (!order && p.sr_order_id) order = (await db.from('orders').select('*').eq('sr_order_id', String(p.sr_order_id)).maybeSingle()).data
    if (!order && p.order_id) {
      const no = String(p.order_id).split('_').pop() // channel order ids can be prefixed
      order = (await db.from('orders').select('*').eq('order_no', no).maybeSingle()).data
    }
    if (!order) return ok('order not found')
    if (Number(p.is_return) === 1) {
      await db.from('orders').update({ shipping_status: 'RETURN: ' + (p.current_status || '') }).eq('id', order.id)
      return ok()
    }
    const label = p.current_status || p.shipment_status
    const patch: any = {
      shipping_status: label || order.shipping_status,
      status: advanceStatus(order.status, mapShipStatus(label)),
    }
    if (p.awb && !order.awb) Object.assign(patch, { awb: String(p.awb), tracking: String(p.awb), tracking_url: `https://shiprocket.co/tracking/${p.awb}` })
    if (p.courier_name) patch.courier = p.courier_name
    if (p.etd) patch.etd = p.etd
    if (Array.isArray(p.scans) && p.scans.length) patch.tracking_events = compactScans([...p.scans].reverse())
    await db.from('orders').update(patch).eq('id', order.id)
    return ok()
  } catch (e) {
    console.error(e)
    return ok('error logged')
  }
})
