-- 20260121_fix_missing_tables.sql
-- Run this in Supabase SQL Editor to fix missing tables

-- 1. Create Settings Table
create table if not exists public.settings (
  id uuid not null default gen_random_uuid (),
  dollar_rate numeric not null default 120,
  office_rent numeric not null default 0,
  monthly_salaries numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint settings_pkey primary key (id)
);

alter table public.settings enable row level security;
-- Drop policies if they exist to avoid errors on re-run
drop policy if exists "Owner view settings" on settings;
drop policy if exists "Owner update settings" on settings;
drop policy if exists "Owner insert settings" on settings;

create policy "Owner view settings" on settings for select using (auth.uid() = user_id);
create policy "Owner update settings" on settings for update using (auth.uid() = user_id);
create policy "Owner insert settings" on settings for insert with check (auth.uid() = user_id);


-- 2. Create Investments Table
create table if not exists public.investments (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date not null,
    capital_amount numeric not null,
    current_return numeric default 0,
    status text default 'active' check (status in ('active', 'closed')),
    user_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.investments enable row level security;
drop policy if exists "Users can view their own investments" on investments;
drop policy if exists "Users can insert their own investments" on investments;
drop policy if exists "Users can update their own investments" on investments;
drop policy if exists "Users can delete their own investments" on investments;

create policy "Users can view their own investments" on investments for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own investments" on investments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own investments" on investments for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own investments" on investments for delete to authenticated using (auth.uid() = user_id);


-- 3. Create Daily Sales Table
create table if not exists public.daily_sales (
  id uuid not null default gen_random_uuid (),
  date date not null default CURRENT_DATE,
  product_id uuid references public.products not null,
  quantity_sold integer not null default 0,
  quantity_returned integer not null default 0,
  ad_cost_dollar numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint daily_sales_pkey primary key (id)
);

alter table public.daily_sales enable row level security;
drop policy if exists "Owner view daily_sales" on daily_sales;
drop policy if exists "Owner insert daily_sales" on daily_sales;
drop policy if exists "Owner update daily_sales" on daily_sales;
drop policy if exists "Owner delete daily_sales" on daily_sales;

create policy "Owner view daily_sales" on daily_sales for select using (auth.uid() = user_id);
create policy "Owner insert daily_sales" on daily_sales for insert with check (auth.uid() = user_id);
create policy "Owner update daily_sales" on daily_sales for update using (auth.uid() = user_id);
create policy "Owner delete daily_sales" on daily_sales for delete using (auth.uid() = user_id);

-- 4. Add 'type' column to products if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'type') then
        alter table public.products add column type text check (type in ('physical', 'digital')) default 'physical';
    end if;
end $$;
