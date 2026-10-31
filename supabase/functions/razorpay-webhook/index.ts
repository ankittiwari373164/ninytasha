// Razorpay → your store. Confirms payments even if the customer closes the browser before returning.
// Deploy:  npx supabase functions deploy razorpay-webhook --no-verify-jwt
// Razorpay Dashboard → Settings → Webhooks → Add:
//   URL:     https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
//   Secret:  any long random text → also set it as RAZORPAY_WEBHOOK_SECRET
//   Events:  payment.captured, payment.failed, order.paid
import { createClient } from 'npm:@supabase/supabase-js@2'
import { hmacHex, safeEqual } from '../_shared/logic.ts'
import { markPaid } from '../_shared/fulfil.ts'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || ''
const ok = (msg = 'ok') => new Response(msg, { status: 200 })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok()
  const raw = await req.text() // verify the exact raw body before parsing
  const sig = req.headers.get('x-razorpay-signature') || ''
  if (!WEBHOOK_SECRET || !safeEqual(await hmacHex(WEBHOOK_SECRET, raw), sig)) return new Response('invalid signature', { status: 401 })

  try {
    const evt = JSON.parse(raw)
    const pay = evt.payload?.payment?.entity
    const rzOrder = evt.payload?.order?.entity
    const rzOrderId = pay?.order_id || rzOrder?.id
    if (!rzOrderId) return ok('no order id')
    const { data: order } = await db.from('orders').select('*').eq('razorpay_order_id', rzOrderId).maybeSingle()
    if (!order) return ok('order not found')

    if (evt.event === 'payment.captured' || evt.event === 'order.paid') {
      const paidPaise = Number(pay?.amount ?? rzOrder?.amount_paid ?? 0)
      if (paidPaise && paidPaise < Math.round(Number(order.total) * 100)) {
        await db.from('orders').update({ notes: `${order.notes || ''}\n[Razorpay] amount mismatch: paid ₹${paidPaise / 100}`.trim() }).eq('id', order.id)
        return ok('amount mismatch')
      }
      await markPaid(db, order.id, pay?.id || order.payment_ref || rzOrderId)
    } else if (evt.event === 'payment.failed' && order.payment_status === 'pending') {
      await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
    }
    return ok()
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 500 }) // Razorpay will retry
  }
})
