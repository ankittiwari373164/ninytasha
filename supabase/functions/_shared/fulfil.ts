// What happens once a payment is confirmed — shared by the checkout verify call and the Razorpay webhook,
// so whichever arrives first does the work exactly once.
import { createShipment, shiprocketConfigured } from './shiprocket.ts'

/** Atomically mark an order paid. Returns the updated order if THIS call made the change, else null. */
export async function markPaid(db: any, orderId: string, paymentId: string) {
  const { data } = await db.from('orders')
    .update({ payment_status: 'paid', status: 'confirmed', payment_ref: paymentId })
    .eq('id', orderId).neq('payment_status', 'paid')
    .select().maybeSingle()
  if (!data) return null
  for (const i of data.items || []) await db.rpc('decrement_stock', { p_id: i.id, p_qty: i.qty })
  await autoShip(db, data)
  return data
}

/** Push to Shiprocket automatically if configured (SHIPROCKET_AUTO_CREATE defaults to "true" for prepaid orders). */
export async function autoShip(db: any, order: any) {
  if (!shiprocketConfigured()) return
  if ((Deno.env.get('SHIPROCKET_AUTO_CREATE') || 'true') !== 'true') return
  try { await createShipment(db, order) }
  catch (e) { await db.from('orders').update({ shipping_status: 'ERROR: ' + String((e as Error).message).slice(0, 180) }).eq('id', order.id) }
}
