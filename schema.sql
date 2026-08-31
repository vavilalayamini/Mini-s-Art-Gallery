-- Mini's Art Gallery: Supabase database setup
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  email text not null,
  phone text not null,
  pincode text not null,
  address text not null,
  note text default '',
  payment_method text not null default 'UPI',
  payment_reference text not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  items jsonb not null,
  status text not null default 'Payment submitted',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Customers can create orders, but cannot read everyone else's orders.
drop policy if exists "public can create orders" on public.orders;
create policy "public can create orders"
on public.orders for insert
to anon, authenticated
with check (
  char_length(customer_name) between 2 and 100
  and char_length(email) between 5 and 200
  and char_length(payment_reference) between 1 and 100
);

-- Only signed-in admin users can view/update orders.
drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders"
on public.orders for select
to authenticated
using (true);

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
on public.orders for update
to authenticated
using (true)
with check (true);

-- Optional hardening: create a dedicated admin user in Supabase Auth
-- rather than sharing credentials.
