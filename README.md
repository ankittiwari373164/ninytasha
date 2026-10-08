# R3 Exports — Glass Diya E-commerce Store

React + Vite storefront with a full admin panel, Framer Motion animations, Supabase backend, and three checkout options (Razorpay, COD + WhatsApp, quote request). On phones the navigation becomes an app-style bottom tab bar — in both the store and the admin.

## Run it right now (demo mode)

```bash
npm install
npm run dev
```

Without Supabase keys the site runs in **demo mode**: all 21 products load from `src/data/products.js`, and orders/enquiries/coupons are saved in the browser.
For the demo admin, copy `.env.example` to `.env`, set `VITE_DEMO_ADMIN_EMAIL` / `VITE_DEMO_ADMIN_PASSWORD`, restart `npm run dev`, and sign in at `/admin`.
(Demo credentials are visible in the browser code — use them only for local testing.)

## Go live with Supabase

1. Create a project at supabase.com.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**. This creates the tables, security rules, image bucket, the `DIWALI10` coupon and all 21 products.
3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
4. Set your admin login as **server secrets** and deploy the login function. These never reach the browser and are not stored in your tables:
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_REF
   npx supabase secrets set ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-unique-password'
   npx supabase functions deploy admin-login --no-verify-jwt
   ```
   Then sign in at `/admin`. To change the password or email, set the secrets again and log in with the new values — the old admin account loses access automatically. (Or put all secrets in `supabase/.env` from `supabase/.env.example` and run `npx supabase secrets set --env-file supabase/.env`.)
5. Optional: Authentication → Providers → Email → turn off "Confirm email" if you want instant sign-in.

## Razorpay

1. Put your public key in `.env` as `VITE_RAZORPAY_KEY_ID`.
2. Deploy the edge function (it re-computes prices server-side and verifies the payment signature):
   ```bash
   npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=xxx
   npx supabase functions deploy razorpay --no-verify-jwt
   ```
Use `rzp_test_` keys first. COD orders open WhatsApp to `VITE_WHATSAPP_NUMBER` with the order details pre-filled.

## Deploy

- **Vercel**: import the repo, framework "Vite", add the `VITE_*` env vars. `vercel.json` handles page refreshes.
- **Netlify**: build `npm run build`, publish `dist`, add env vars. `public/_redirects` handles routing.

## What's inside

**Store pages:** Home (parallax hero, floating embers, categories, bestsellers, sale countdown, bulk range, story, reviews, gallery) · Shop with category/price/pack filters, sorting and search · Product page with gallery, colour picker, bulk tier selector, reviews, related items · Cart with free-shipping progress · Checkout with coupons and 3 payment methods · Order success · Wishlist · Account (login/signup, order history with progress bar) · Corporate/bulk page with price table and quote form · About · Contact · FAQ · Track order · Shipping / Returns / Privacy / Terms · 404.

**Admin (`/admin`):** Dashboard (revenue chart, KPIs, top products, low stock) · Orders (search, status filters, detail view, status & payment updates, courier tracking, printable GST invoice, WhatsApp the customer, CSV export) · Products (add/edit/delete, image upload to Supabase Storage, bulk tier pricing, stock, visibility, featured) · Enquiries & quotes pipeline · Customers · Coupons · Newsletter subscribers.

## Customising

- Brand name, address, phone, shipping fees: `src/lib/config.js`
- Colours and fonts: top of `src/styles.css`
- Sale countdown end date: `src/pages/Home.jsx` (`Countdown`)
- Product images live in `public/products/` (extracted from your catalogues — replace with higher-res photos when you have them).

## Troubleshooting

- **"Cannot find module 'tailwindcss'" / PostCSS error:** fixed in `vite.config.js` — the project no longer reads `postcss.config.js` files from parent folders (e.g. an old one in Downloads).
