-- Stockroom Inventory database schema
-- Run this entire script in Supabase Dashboard → SQL Editor.
-- Each signed-in user owns their own categories and products.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  description text not null default '' check (char_length(description) <= 200),
  created_at timestamptz not null default now(),
  constraint categories_user_name_unique unique (user_id, name),
  constraint categories_id_user_id_unique unique (id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid,
  name text not null check (char_length(trim(name)) between 1 and 100),
  sku text not null check (char_length(trim(sku)) between 1 and 40),
  description text not null default '' check (char_length(description) <= 500),
  price numeric(12,2) not null default 0 check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  reorder_level integer not null default 5 check (reorder_level >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_user_sku_unique unique (user_id, sku),
  constraint products_category_owner_fk
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete set null (category_id)
);

create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_category_id_idx on public.products(category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "Users can view their own categories" on public.categories;
create policy "Users can view their own categories"
on public.categories for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own categories" on public.categories;
create policy "Users can create their own categories"
on public.categories for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
on public.categories for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
on public.categories for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view their own products" on public.products;
create policy "Users can view their own products"
on public.products for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own products" on public.products;
create policy "Users can create their own products"
on public.products for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products"
on public.products for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own products" on public.products;
create policy "Users can delete their own products"
on public.products for delete to authenticated
using (auth.uid() = user_id);

-- Grant normal authenticated users access through the RLS policies.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;