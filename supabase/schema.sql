-- =====================================================================
-- R3 Exports store — Supabase schema
-- Run in Supabase → SQL Editor → New query → Run. Safe to run again.
-- =====================================================================

-- ---------- profiles ----------
-- Admin access is NOT stored here. It comes from the ADMIN_EMAIL / ADMIN_PASSWORD
-- secrets checked by the admin-login edge function, which stamps the admin
-- claim into the user's app_metadata (users cannot edit app_metadata themselves).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  created_at timestamptz default now()
);
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------- products ----------
create table if not exists public.products (
  id text primary key,
  sku text unique not null,
  name text not null,
  category text not null,
  price numeric not null,
  mrp numeric default 0,
  pack int default 1,
  stock int default 0,
  min_qty int default 1,
  size text,
  tiers jsonb,                -- wholesale: [{ "min": 100, "price": 105, "carton": 12 }, ...]
  wholesale_unit text default 'piece',   -- wholesale rate is per 'piece' or per 'set'
  color_note text,
  packing text,                -- e.g. '100 pcs master box'
  images text[] default '{}',
  colors text[] default '{}',
  description text,
  featured boolean default false,
  active boolean default true,
  rating numeric default 5,
  reviews int default 0,
  created_at timestamptz default now()
);

-- columns added in v2 (safe to re-run on an existing database)
alter table public.products add column if not exists size text;
alter table public.products add column if not exists wholesale_unit text default 'piece';
alter table public.products add column if not exists color_note text;
alter table public.products add column if not exists packing text;

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  user_id uuid references auth.users on delete set null,
  name text, email text, phone text, company text, gst text,
  address text, city text, state text, pincode text, notes text,
  items jsonb not null,       -- [{ id, sku, name, qty, price, color, image }]
  subtotal numeric, discount numeric default 0, shipping numeric default 0, total numeric not null,
  coupon text,
  payment_method text check (payment_method in ('razorpay','cod')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_ref text, razorpay_order_id text,
  status text default 'pending' check (status in ('pending','confirmed','packed','shipped','delivered','cancelled')),
  tracking text,
  created_at timestamptz default now()
);

-- Public order tracking without exposing the table
create or replace function public.track_order(p_order_no text, p_phone text)
returns table (order_no text, status text, total numeric, tracking text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select order_no, status, total, tracking, created_at from public.orders
  where order_no = p_order_no and regexp_replace(phone, '\D', '', 'g') like '%' || right(regexp_replace(p_phone, '\D', '', 'g'), 10);
$$;

create or replace function public.decrement_stock(p_id text, p_qty int) returns void
language sql security definer set search_path = public as $$
  update public.products set stock = greatest(0, stock - p_qty) where id = p_id;
$$;
revoke execute on function public.decrement_stock(text, int) from public, anon, authenticated;

-- ---------- enquiries, coupons, reviews, subscribers ----------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text default 'contact',   -- contact | bulk | quote
  name text, email text, phone text, company text, message text,
  items jsonb, estimate numeric,
  status text default 'new',
  created_at timestamptz default now()
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text default 'percent' check (type in ('percent','flat')),
  value numeric not null,
  min_order numeric default 0,
  active boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products on delete cascade,
  name text, rating int check (rating between 1 and 5), body text,
  approved boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz default now()
);

create or replace view public.customer_summary with (security_invoker = true) as
  select email, max(name) as name, max(phone) as phone, count(*) as orders, sum(total) as spent
  from public.orders where status <> 'cancelled' group by email;

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.enquiries enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "admin profiles" on public.profiles;
drop policy if exists "edit own profile" on public.profiles;
create policy "edit own profile" on public.profiles for update using (id = auth.uid());

drop policy if exists "read active products" on public.products;
create policy "read active products" on public.products for select using (active or public.is_admin());
drop policy if exists "admin products" on public.products;
create policy "admin products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "place order" on public.orders;
create policy "place order" on public.orders for insert with check (payment_status = 'pending' and status = 'pending');
drop policy if exists "read own orders" on public.orders;
create policy "read own orders" on public.orders for select using (public.is_admin() or email = auth.email() or user_id = auth.uid());
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (public.is_admin());

drop policy if exists "send enquiry" on public.enquiries;
create policy "send enquiry" on public.enquiries for insert with check (true);
drop policy if exists "admin enquiries" on public.enquiries;
create policy "admin enquiries" on public.enquiries for all using (public.is_admin());

drop policy if exists "read active coupons" on public.coupons;
create policy "read active coupons" on public.coupons for select using (active or public.is_admin());
drop policy if exists "admin coupons" on public.coupons;
create policy "admin coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews" on public.reviews for select using (approved or public.is_admin());
drop policy if exists "write review" on public.reviews;
create policy "write review" on public.reviews for insert with check (approved = false);
drop policy if exists "admin reviews" on public.reviews;
create policy "admin reviews" on public.reviews for all using (public.is_admin());

drop policy if exists "subscribe" on public.subscribers;
create policy "subscribe" on public.subscribers for insert with check (true);
drop policy if exists "admin subscribers" on public.subscribers;
create policy "admin subscribers" on public.subscribers for select using (public.is_admin());


-- ---------- storage for product images ----------
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- ---------- seed data ----------
insert into public.coupons (code, type, value, min_order) values ('DIWALI10', 'percent', 10, 499) on conflict do nothing;

-- Catalogue: only the products from the retail price album (KW-50 … KW-75).
-- This removes every other product. Products you add later in Admin → Products
-- will also be removed if you re-run this file — re-run it only to reset the catalogue.
delete from public.products where id not in ('kw-50', 'kw-51', 'kw-52', 'kw-53', 'kw-54', 'kw-55', 'kw-56', 'kw-57', 'kw-58', 'kw-59', 'kw-60', 'kw-61', 'kw-62', 'kw-63', 'kw-64', 'kw-65', 'kw-66', 'kw-67', 'kw-68', 'kw-69', 'kw-70', 'kw-71', 'kw-72', 'kw-73', 'kw-74', 'kw-75');

insert into public.products (id, sku, name, category, price, mrp, pack, size, packing, stock, min_qty, tiers, wholesale_unit, images, colors, color_note, description, featured, active, rating, reviews) values
  ('kw-50', 'KW-50', 'Modak Glass Oil Diya — Clear', 'modak-diyas', 129, 0, 1, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-50-1.jpg','/products/kw-50-2.jpg']::text[], array[]::text[], null, 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', true, true, 0, 0),
  ('kw-51', 'KW-51', 'Modak Glass Oil Diya — Clear, Pack of 2', 'modak-diyas', 199, 0, 2, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-51-1.jpg','/products/kw-51-2.jpg']::text[], array[]::text[], null, 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', false, true, 0, 0),
  ('kw-52', 'KW-52', 'Modak Glass Oil Diya — Clear, Pack of 4', 'modak-diyas', 350, 0, 4, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-52-1.jpg']::text[], array[]::text[], null, 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', true, true, 0, 0),
  ('kw-53', 'KW-53', 'Modak Glass Oil Diya — Clear, Pack of 6', 'modak-diyas', 499, 0, 6, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-53-1.jpg','/products/kw-53-2.jpg']::text[], array[]::text[], null, 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', false, true, 0, 0),
  ('kw-54', 'KW-54', 'Coloured Modak Glass Oil Diya', 'modak-diyas', 99, 0, 1, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-54-1.jpg']::text[], array[]::text[], 'Colour as shown / assorted', 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', true, true, 0, 0),
  ('kw-55', 'KW-55', 'Coloured Modak Glass Oil Diya — Pack of 2', 'modak-diyas', 199, 0, 2, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-55-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', false, true, 0, 0),
  ('kw-56', 'KW-56', 'Coloured Modak Glass Oil Diya — Pack of 4', 'modak-diyas', 550, 0, 4, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-56-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', true, true, 0, 0),
  ('kw-57', 'KW-57', 'Coloured Modak Glass Oil Diya — Pack of 6', 'modak-diyas', 499, 0, 6, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-57-1.jpg','/products/kw-57-2.jpg','/products/kw-57-3.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass — a premium oil lamp for Diwali, pooja and home décor. The ribbed body refracts the flame beautifully. Use with lamp oil and a cotton wick.', false, true, 0, 0),
  ('kw-58', 'KW-58', 'Tall Akhand Jyot Aarti Diya — Large', 'akhand-jyot', 250, 0, 1, 'Large', '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-58-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'Handcrafted borosilicate akhand jyot — a tall aarti glass diya with a multi-wick clear bowl on a tiered glass stem. A traditional oil lamp for pooja, Diwali, mandir and spiritual gifting.', true, true, 0, 0),
  ('kw-59', 'KW-59', 'Akhand Jyot, Small Diya & Bell — 3-Piece Pooja Set', 'pooja-gift-sets', 499, 0, 3, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-59-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'A three-piece pooja gift set: a handcrafted glass akhand jyot with a clear bowl on an amber base, a small akhand jyot and a glass temple bell.', true, true, 0, 0),
  ('kw-60', 'KW-60', '3-Piece Pooja Gift Set with Box', 'pooja-gift-sets', 699, 0, 3, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-60-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'The three-piece akhand jyot, small diya and glass bell set, presented in a gift box — ready for Diwali and festive gifting.', true, true, 0, 0),
  ('kw-61', 'KW-61', 'Small Akhand Jyot', 'akhand-jyot', 150, 0, 1, 'Small', '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-61-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed base — a traditional oil lamp for pooja, Diwali, mandir, festive home décor and spiritual gifting.', true, true, 0, 0),
  ('kw-62', 'KW-62', 'Small Akhand Jyot — Pack of 2', 'akhand-jyot', 299, 0, 2, 'Small', '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-62-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed base — a traditional oil lamp for pooja, Diwali, mandir, festive home décor and spiritual gifting.', false, true, 0, 0),
  ('kw-63', 'KW-63', 'Small Akhand Jyot — Pack of 4', 'akhand-jyot', 599, 0, 4, 'Small', '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-63-1.jpg']::text[], array[]::text[], 'Available in six assorted colours', 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed base — a traditional oil lamp for pooja, Diwali, mandir, festive home décor and spiritual gifting.', false, true, 0, 0),
  ('kw-64', 'KW-64', 'Glass Temple Bell with Om', 'temple-bells', 150, 0, 1, null, '100 pcs master box', 500, 1, null, 'piece', array['/products/kw-64-1.jpg']::text[], array[]::text[], null, 'Handcrafted glass temple bell with an Om motif in amber colour, a twisted glass stem and a red finial — a decorative pooja bell for your mandir.', true, true, 0, 0),
  ('kw-65', 'KW-65', 'Silver-Fumed Goblet Cocktail Glass', 'stemmed-glasses', 699, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-65-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted borosilicate cocktail glass with a silver-fumed textured design. Available in single or assorted colours, in single or double-piece packing.', true, true, 0, 0),
  ('kw-66', 'KW-66', 'Silver-Fumed Cocktail Tumbler', 'cocktail-tumblers', 399, 0, 1, '4.5 inch', 'Master box packing', 500, 1, null, 'piece', array['/products/kw-66-1.jpg']::text[], array[]::text[], 'Single or assorted colours', 'Handcrafted borosilicate cocktail glass with a silver-fumed textured design. Available in single or assorted colours, in single or double-piece packing.', true, true, 0, 0),
  ('kw-67', 'KW-67', 'Flower Plant Cocktail Tumbler', 'cocktail-tumblers', 399, 0, 1, '4.5 inch', 'Master box packing', 500, 1, null, 'piece', array['/products/kw-67-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted borosilicate cocktail glass with a tiny embossed flower-plant design — a cheerful glass for cocktails, juices and iced drinks.', true, true, 0, 0),
  ('kw-68', 'KW-68', 'Ribbed Martini Cocktail Glass', 'stemmed-glasses', 299, 0, 1, '8 inch', 'Master box packing', 500, 1, null, 'piece', array['/products/kw-68-1.jpg']::text[], array[]::text[], 'Transparent', 'Handcrafted borosilicate martini-style cocktail glass with a ribbed bowl on a slender stem. Clear, transparent glass.', true, true, 0, 0),
  ('kw-69', 'KW-69', 'Silver-Fumed Stemmed Goblet', 'stemmed-glasses', 399, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-69-1.jpg']::text[], array[]::text[], 'Single or assorted colours', 'Handcrafted borosilicate cocktail glass with a silver-fumed textured design. Available in single or assorted colours, in single or double-piece packing.', false, true, 0, 0),
  ('kw-70', 'KW-70', 'Coloured Stemmed Cocktail Glass', 'stemmed-glasses', 399, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-70-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted borosilicate stemmed cocktail glass with a tulip-shaped bowl, in assorted colours.', true, true, 0, 0),
  ('kw-71', 'KW-71', 'Coloured Cocktail Flute', 'stemmed-glasses', 399, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-71-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted borosilicate cocktail flute on a ringed coloured stem — a festive glass for champagne, mocktails and cocktails. Assorted colours.', false, true, 0, 0),
  ('kw-72', 'KW-72', 'Silver-Fumed Tall Cocktail Glass', 'stemmed-glasses', 399, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-72-1.jpg']::text[], array[]::text[], 'Single or assorted colours', 'Handcrafted borosilicate cocktail glass with a silver-fumed textured design. Available in single or assorted colours, in single or double-piece packing.', false, true, 0, 0),
  ('kw-73', 'KW-73', 'Flower Embossed Glass Tumbler', 'cocktail-tumblers', 399, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-73-1.jpg']::text[], array[]::text[], 'Assorted colours', 'Handcrafted borosilicate cocktail glass with a tiny flower plant rising from the base — a statement glass for drinks and display.', false, true, 0, 0),
  ('kw-74', 'KW-74', 'Citrus Icon Cocktail Tumbler', 'cocktail-tumblers', 499, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-74-1.jpg']::text[], array[]::text[], 'Assorted icons', 'Handcrafted borosilicate cocktail glass decorated with hand-applied citrus-slice icons in different assorted designs.', true, true, 0, 0),
  ('kw-75', 'KW-75', 'Embossed Icon Cocktail Tumbler', 'cocktail-tumblers', 499, 0, 1, null, 'Master box packing', 500, 1, null, 'piece', array['/products/kw-75-1.jpg']::text[], array[]::text[], 'Assorted icons', 'Handcrafted borosilicate cocktail glass with hand-applied embossed glass icons in different assorted designs.', false, true, 0, 0)
on conflict (id) do update set sku = excluded.sku, name = excluded.name, category = excluded.category, price = excluded.price, mrp = excluded.mrp, pack = excluded.pack, size = excluded.size, packing = excluded.packing, min_qty = excluded.min_qty, tiers = excluded.tiers, wholesale_unit = excluded.wholesale_unit, images = excluded.images, colors = excluded.colors, color_note = excluded.color_note, description = excluded.description, featured = excluded.featured, active = excluded.active;

-- ---------- admin login ----------
-- Admin credentials live in Supabase secrets, not in this database:
--   npx supabase secrets set ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-password'
--   npx supabase functions deploy admin-login --no-verify-jwt
