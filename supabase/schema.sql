-- =====================================================================
-- R3 Exports store — Supabase schema
-- Run once in Supabase → SQL Editor → New query → Run.
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
  tiers jsonb,                -- [{ "min": 100, "price": 105 }, ...] for bulk items
  images text[] default '{}',
  colors text[] default '{}',
  description text,
  featured boolean default false,
  active boolean default true,
  rating numeric default 5,
  reviews int default 0,
  created_at timestamptz default now()
);

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

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "edit own profile" on public.profiles for update using (id = auth.uid());

create policy "read active products" on public.products for select using (active or public.is_admin());
create policy "admin products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "place order" on public.orders for insert with check (payment_status = 'pending' and status = 'pending');
create policy "read own orders" on public.orders for select using (public.is_admin() or email = auth.email() or user_id = auth.uid());
create policy "admin update orders" on public.orders for update using (public.is_admin());

create policy "send enquiry" on public.enquiries for insert with check (true);
create policy "admin enquiries" on public.enquiries for all using (public.is_admin());

create policy "read active coupons" on public.coupons for select using (active or public.is_admin());
create policy "admin coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "read approved reviews" on public.reviews for select using (approved or public.is_admin());
create policy "write review" on public.reviews for insert with check (approved = false);
create policy "admin reviews" on public.reviews for all using (public.is_admin());

create policy "subscribe" on public.subscribers for insert with check (true);
create policy "admin subscribers" on public.subscribers for select using (public.is_admin());


-- ---------- storage for product images ----------
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- ---------- seed data ----------
insert into public.coupons (code, type, value, min_order) values ('DIWALI10', 'percent', 10, 499) on conflict do nothing;

insert into public.products (id, sku, name, category, price, mrp, pack, stock, min_qty, tiers, images, colors, description, featured, active, rating, reviews) values
  ('kw-50', 'KW-50', 'Modak Glass Oil Diya — Clear', 'modak-diyas', 149, 249, 1, 200, 1, null, array['/products/kw01.jpg']::text[], array['Clear']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', true, true, 4.8, 42),
  ('kw-51', 'KW-51', 'Modak Glass Oil Diya — Pack of 2', 'modak-diyas', 249, 449, 2, 200, 1, null, array['/products/kw02.jpg']::text[], array['Clear']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', false, true, 4.7, 18),
  ('kw-52', 'KW-52', 'Modak Glass Oil Diya — Pack of 4', 'modak-diyas', 499, 899, 4, 200, 1, null, array['/products/kw03.jpg']::text[], array['Clear']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', true, true, 4.7, 18),
  ('kw-53', 'KW-53', 'Modak Glass Oil Diya — Pack of 6', 'modak-diyas', 650, 1299, 6, 200, 1, null, array['/products/kw04.jpg']::text[], array['Clear']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', false, true, 4.7, 18),
  ('kw-54', 'KW-54', 'Coloured Modak Diya — Single', 'modak-diyas', 165, 299, 1, 200, 1, null, array['/products/kw05.jpg']::text[], array['Blue','Red','Yellow','Clear']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', false, true, 4.9, 31),
  ('kw-55', 'KW-55', 'Coloured Modak Diya — Pack of 2', 'modak-diyas', 299, 549, 2, 200, 1, null, array['/products/kw06.jpg']::text[], array['Assorted']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', false, true, 4.7, 18),
  ('kw-56', 'KW-56', 'Coloured Modak Diya — Pack of 4', 'modak-diyas', 599, 1099, 4, 200, 1, null, array['/products/kw07.jpg']::text[], array['Assorted']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', true, true, 4.9, 57),
  ('kw-57', 'KW-57', 'Coloured Modak Diya — Pack of 6', 'modak-diyas', 699, 1499, 6, 200, 1, null, array['/products/kw08.jpg']::text[], array['Assorted']::text[], 'Handcrafted modak-shaped oil diya in heat-resistant borosilicate glass. The ribbed body refracts the flame beautifully — a premium oil lamp for Diwali, pooja and everyday table décor. Fill with any lamp oil and a cotton wick.', false, true, 4.7, 18),
  ('kw-58', 'KW-58', 'Tall Akhand Jyot Aarti Diya', 'akhand-jyot', 599, 999, 1, 200, 1, null, array['/products/kw09.jpg']::text[], array['6 assorted colours']::text[], 'A tall borosilicate aarti diya with a multi-wick bowl over a tiered glass stem. Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed amber base. A traditional oil lamp for pooja, Diwali, mandir and festive home décor — and a thoughtful spiritual gift.', true, true, 4.7, 18),
  ('kw-59', 'KW-59', 'Akhand Jyot, Small Jyot & Bell — 3-pc Set', 'gift-sets', 1499, 2299, 3, 200, 1, null, array['/products/kw10.jpg']::text[], array['6 assorted colours']::text[], 'Three-piece pooja gift set: tall akhand jyot, small akhand jyot and a glass temple bell. Available in six assorted colours.', false, true, 4.7, 18),
  ('kw-60', 'KW-60', 'Akhand Jyot 3-pc Gift Set with Box', 'gift-sets', 1699, 2599, 3, 200, 1, null, array['/products/kw11.jpg']::text[], array['6 assorted colours']::text[], 'The three-piece akhand jyot and bell set, presented in a premium rigid gift box — ready to hand over.', true, true, 4.7, 18),
  ('kw-61', 'KW-61', 'Small Akhand Jyot — Single', 'akhand-jyot', 299, 499, 1, 200, 1, null, array['/products/kw12.jpg']::text[], array['6 assorted colours']::text[], 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed amber base. A traditional oil lamp for pooja, Diwali, mandir and festive home décor — and a thoughtful spiritual gift.', false, true, 4.7, 18),
  ('kw-62', 'KW-62', 'Small Akhand Jyot — Pack of 2', 'akhand-jyot', 349, 699, 2, 200, 1, null, array['/products/kw13.jpg']::text[], array['6 assorted colours']::text[], 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed amber base. A traditional oil lamp for pooja, Diwali, mandir and festive home décor — and a thoughtful spiritual gift.', false, true, 4.8, 26),
  ('kw-63', 'KW-63', 'Small Akhand Jyot — Pack of 4', 'akhand-jyot', 799, 1299, 4, 200, 1, null, array['/products/kw14.jpg']::text[], array['6 assorted colours']::text[], 'Handcrafted glass table diya (akhand jyot) with a clear bowl on a ribbed amber base. A traditional oil lamp for pooja, Diwali, mandir and festive home décor — and a thoughtful spiritual gift.', false, true, 4.7, 18),
  ('kw-64', 'KW-64', 'Glass Temple Bell with Om', 'bells', 220, 399, 1, 200, 1, null, array['/products/kw15.jpg']::text[], array['Amber']::text[], 'Handcrafted decorative pooja bell in clear glass with a gold Om motif, twisted stem and ruby finial.', false, true, 4.7, 18),
  ('r3b01', 'R3B01', 'Crystal Bell (Bulk)', 'corporate', 105, 199, 1, 200, 100, '[{"min":100,"price":105},{"min":500,"price":95},{"min":1000,"price":85}]'::jsonb, array['/products/r3_002.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], 'A hand-finished borosilicate glass bell with a hexagonal base and jewel-toned finial. 5 inch. Ideal for corporate Diwali gifting.', true, true, 4.7, 18),
  ('r3d01', 'R3D01', 'Fluted Diya Oil Lamp & Tealight (Bulk)', 'corporate', 105, 199, 1, 200, 100, '[{"min":100,"price":105},{"min":500,"price":95},{"min":1000,"price":85}]'::jsonb, array['/products/r3_003.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], 'A 3 inch fluted glass diya that works with oil or a tealight; its ridged base catches the glow of the flame.', false, true, 4.7, 18),
  ('r3md01', 'R3MD01', 'Modak Diya Oil Lamp (Bulk)', 'corporate', 105, 199, 1, 200, 100, '[{"min":100,"price":105},{"min":500,"price":95},{"min":1000,"price":85}]'::jsonb, array['/products/r3_004.jpg']::text[], array['Clear']::text[], '4 inch modak-shaped ribbed vessel that doubles as an oil lamp — a distinctive alternative to the classic diya.', false, true, 4.7, 18),
  ('r3bd01', 'R3BD01', 'Bell & Diya Gift Set (Bulk)', 'corporate', 190, 349, 2, 200, 100, '[{"min":100,"price":190},{"min":500,"price":155},{"min":1000,"price":140}]'::jsonb, array['/products/r3_005.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], 'Crystal Bell (5") paired with the fluted Diya (3"), gift-boxed as one set.', false, true, 4.7, 18),
  ('r3bmd01', 'R3BMD01', 'Bell & Modak Diya Gift Set (Bulk)', 'corporate', 190, 349, 2, 200, 100, '[{"min":100,"price":190},{"min":500,"price":155},{"min":1000,"price":140}]'::jsonb, array['/products/r3_006.jpg']::text[], array['Bell: 4 colours','Modak: Clear']::text[], 'Crystal Bell (5") with the clear Modak Diya (4") — two signature silhouettes in one gift set.', false, true, 4.7, 18),
  ('r3com01', 'R3COM01', 'Bell, Modak Diya & Diya Trio (Bulk)', 'corporate', 290, 549, 3, 200, 100, '[{"min":100,"price":290},{"min":500,"price":270},{"min":1000,"price":250}]'::jsonb, array['/products/r3_007.jpg']::text[], array['Bell: 4 colours','Modak: Clear']::text[], 'The flagship premium client gift: bell, fluted diya and modak diya together in one set.', true, true, 4.7, 18)
on conflict (id) do nothing;

-- ---------- admin login ----------
-- Admin credentials live in Supabase secrets, not in this database:
--   npx supabase secrets set ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-password'
--   npx supabase functions deploy admin-login --no-verify-jwt
