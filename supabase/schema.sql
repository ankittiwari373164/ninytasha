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
  size text,
  tiers jsonb,                -- wholesale: [{ "min": 100, "price": 105, "carton": 12 }, ...]
  wholesale_unit text default 'piece',   -- wholesale rate is per 'piece' or per 'set'
  color_note text,
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

-- remove the products from the first version of the site
delete from public.products where id in ('kw-51','kw-52','kw-53','kw-54','kw-55','kw-56','kw-57','kw-58','kw-59','kw-60','kw-61','kw-62','kw-63','r3b01','r3d01','r3md01','r3bd01','r3bmd01','r3com01');

insert into public.products (id, sku, name, category, price, mrp, pack, size, stock, min_qty, tiers, wholesale_unit, images, colors, color_note, description, featured, active, rating, reviews) values
  ('kw-50', 'KW-50', 'Modak Diya Oil Lamp & Tealight', 'diyas', 149, 0, 1, '4 inch', 500, 1, '[{"min":100,"price":105,"carton":null},{"min":500,"price":95,"carton":null},{"min":1000,"price":85,"carton":null}]'::jsonb, 'piece', array['/products/modak-diya.jpg','/products/modak-diya-poster.jpg']::text[], array['Clear']::text[], null, 'A distinctive ribbed glass diya inspired by the traditional Modak form, designed for oil or tealight use. Hand-finished in premium borosilicate glass — the ribs catch and multiply the glow of the flame.', true, true, 0, 0),
  ('kw-65', 'KW-65', 'Bell & Diya Set', 'gift-sets', 349, 0, 2, 'Bell 5" + Diya 3"', 500, 1, '[{"min":100,"price":190,"carton":null},{"min":500,"price":155,"carton":null},{"min":1000,"price":140,"carton":null}]'::jsonb, 'set', array['/products/bell-diya-set.jpg','/products/bell-diya-set-poster.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], null, 'A handcrafted Crystal Bell paired with a fluted glass Diya — an elegant festive gifting combination. Perfect for Diwali, pooja and client gifting.', true, true, 0, 0),
  ('kw-64', 'KW-64', 'Crystal Bell', 'bells', 199, 0, 1, '5 inch', 500, 1, '[{"min":100,"price":105,"carton":12},{"min":500,"price":95,"carton":12},{"min":1000,"price":85,"carton":4}]'::jsonb, 'piece', array['/products/crystal-bell.jpg','/products/crystal-bell-poster.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], null, 'A hand-finished borosilicate glass bell with a hexagonal base, Om motif and a jewel-toned finial. Available in four colourways.', true, true, 0, 0),
  ('kw-64-4', 'KW-64-4', 'Diya Oil Lamp & Tealight — Combo of 4', 'diyas', 799, 0, 4, '3 inch', 500, 1, '[{"min":100,"price":105,"carton":12},{"min":500,"price":95,"carton":12},{"min":1000,"price":85,"carton":4}]'::jsonb, 'piece', array['/products/diya-combo-4.jpg','/products/diya-combo-4-poster.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], 'Combo includes one of each colour', 'A fluted glass diya that works equally well with oil or a tealight, its ridged base catching the flame’s glow. This combo brings all four colours together.', true, true, 0, 0),
  ('kw-66', 'KW-66', 'Bell, Modak Diya & Diya Trio', 'gift-sets', 1499, 0, 3, 'Bell 5" + Diya 3" + Modak Diya 4"', 500, 1, '[{"min":100,"price":290,"carton":null},{"min":500,"price":270,"carton":null},{"min":1000,"price":250,"carton":null}]'::jsonb, 'set', array['/products/trio-set.jpg','/products/trio-set-poster.jpg']::text[], array['Blue','Orange','Pink','Green']::text[], 'Colour applies to the bell · Modak Diya is clear', 'The full collection in one set — bell, diya and modak diya together. The flagship option for premium festive and client gifting.', true, true, 0, 0)
on conflict (id) do update set sku = excluded.sku, name = excluded.name, category = excluded.category, price = excluded.price, mrp = excluded.mrp, pack = excluded.pack, size = excluded.size, min_qty = excluded.min_qty, tiers = excluded.tiers, wholesale_unit = excluded.wholesale_unit, images = excluded.images, colors = excluded.colors, color_note = excluded.color_note, description = excluded.description, featured = excluded.featured, active = excluded.active;

-- ---------- admin login ----------
-- Admin credentials live in Supabase secrets, not in this database:
--   npx supabase secrets set ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-password'
--   npx supabase functions deploy admin-login --no-verify-jwt
