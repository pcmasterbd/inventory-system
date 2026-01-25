-- Create product_ad_spends table
create table if not exists public.product_ad_spends (
  id uuid not null default gen_random_uuid (),
  product_id uuid references public.products not null,
  date timestamp with time zone not null default now(),
  amount_dollar numeric not null default 0,
  exchange_rate numeric not null default 120, -- Default conversion rate
  amount_bdt numeric generated always as (amount_dollar * exchange_rate) stored,
  platform text default 'facebook', -- 'facebook', 'google', etc.
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint product_ad_spends_pkey primary key (id)
);

-- Enable RLS
alter table public.product_ad_spends enable row level security;

-- Create Policies
create policy "Owner view ad_spends" on product_ad_spends for select using (auth.uid() = user_id);
create policy "Owner insert ad_spends" on product_ad_spends for insert with check (auth.uid() = user_id);
create policy "Owner update ad_spends" on product_ad_spends for update using (auth.uid() = user_id);
create policy "Owner delete ad_spends" on product_ad_spends for delete using (auth.uid() = user_id);

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
