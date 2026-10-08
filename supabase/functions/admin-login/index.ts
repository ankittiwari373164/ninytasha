// Supabase Edge Function: admin sign-in using credentials stored as secrets.
//   npx supabase secrets set ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-password'
//   npx supabase functions deploy admin-login --no-verify-jwt
// On a correct email/password it makes sure a Supabase user exists with that
// email + password and the admin claim in app_metadata, then the browser signs
// in normally. Changing the secret password and logging in again rotates it.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const ADMIN_EMAIL = (Deno.env.get('ADMIN_EMAIL') || '').toLowerCase().trim()
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || ''
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// constant-time string compare
const same = (a: string, b: string) => {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b)
  let d = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return d === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!ADMIN_EMAIL || ADMIN_PASSWORD.length < 8) return json({ error: 'Admin secrets not configured on the server' }, 500)
  try {
    const { email, password } = await req.json()
    const okEmail = same(String(email || '').toLowerCase().trim(), ADMIN_EMAIL)
    const okPass = same(String(password || ''), ADMIN_PASSWORD)
    if (!okEmail || !okPass) {
      await new Promise((r) => setTimeout(r, 800)) // slow down guessing
      return json({ error: 'Invalid admin credentials' }, 401)
    }
    // Scan users: find the admin account, and strip the admin claim from anyone else
    // (e.g. the old account after ADMIN_EMAIL was changed)
    let user = null
    for (let page = 1; ; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
      if (error) throw error
      for (const u of data.users) {
        if (u.email?.toLowerCase() === ADMIN_EMAIL) user = u
        else if (u.app_metadata?.role === 'admin') await db.auth.admin.updateUserById(u.id, { app_metadata: { role: null } })
      }
      if (data.users.length < 200) break
    }
    const attrs = { password: ADMIN_PASSWORD, email_confirm: true, app_metadata: { role: 'admin' }, user_metadata: { name: 'Admin' } }
    const res = user ? await db.auth.admin.updateUserById(user.id, attrs) : await db.auth.admin.createUser({ email: ADMIN_EMAIL, ...attrs })
    if (res.error) throw res.error
    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500)
  }
})
