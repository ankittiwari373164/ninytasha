// Supabase Edge Function: creates Razorpay orders and verifies payments.
// Deploy:  supabase functions deploy razorpay --no-verify-jwt
// Secrets: supabase secrets set RAZORPAY_KEY_ID=rzp_... RAZORPAY_KEY_SECRET=...
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const KEY = Deno.env.get('RAZORPAY_KEY_ID')!
const SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const unitPrice = (p: any, qty: number) => {
  if (!p.tiers?.length) return Number(p.price)
  const t = [...p.tiers].sort((a, b) => b.min - a.min).find((t) => qty >= t.min)
  return Number(t?.price ?? p.tiers[0].price)
}

async function hmac(msg: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()
    const { data: order } = await db.from('orders').select('*').eq('id', body.order_id).single()
    if (!order) return json({ error: 'Order not found' }, 404)

    if (body.action === 'create') {
      // Recompute the total server-side so a tampered browser can't change the price
      const ids = order.items.map((i: any) => i.id)
      const { data: products } = await db.from('products').select('*').in('id', ids)
      let subtotal = 0
      for (const i of order.items) {
        const p = products!.find((x: any) => x.id === i.id)
        if (!p) return json({ error: `Unknown product ${i.id}` }, 400)
        subtotal += unitPrice(p, Math.max(i.qty, p.min_qty || 1)) * i.qty
      }
      let discount = 0
      if (order.coupon) {
        const { data: c } = await db.from('coupons').select('*').eq('code', order.coupon).eq('active', true).maybeSingle()
        if (c && subtotal >= Number(c.min_order)) discount = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Number(c.value)
      }
      const shipping = subtotal >= 999 ? 0 : 79
      const total = Math.max(0, subtotal - discount + shipping)

      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa(`${KEY}:${SECRET}`) },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'INR', receipt: order.order_no }),
      })
      const rz = await r.json()
      if (!r.ok) return json({ error: rz.error?.description || 'Razorpay error' }, 400)
      await db.from('orders').update({ razorpay_order_id: rz.id, subtotal, discount, shipping, total }).eq('id', order.id)
      return json({ id: rz.id, amount: rz.amount })
    }

    if (body.action === 'verify') {
      const expected = await hmac(`${order.razorpay_order_id}|${body.razorpay_payment_id}`)
      if (expected !== body.razorpay_signature) {
        await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id)
        return json({ error: 'Signature mismatch' }, 400)
      }
      await db.from('orders').update({ payment_status: 'paid', status: 'confirmed', payment_ref: body.razorpay_payment_id }).eq('id', order.id)
      // Decrement stock
      for (const i of order.items) await db.rpc('decrement_stock', { p_id: i.id, p_qty: i.qty })
      return json({ ok: true })
    }
    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
