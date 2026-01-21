-- 20260121_daily_sales_system.sql

-- ==========================================
-- 1. SETTINGS TABLE (Global Configurations)
-- ==========================================
create table if not exists public.settings (
  id uuid not null default gen_random_uuid (),
  dollar_rate numeric not null default 120, -- Default dollar rate
  office_rent numeric not null default 0,
  monthly_salaries numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  -- Ensure only one row exists for global settings or allow multiple for history
  -- For simplicity, we might just use the latest or a specific ID. 
  -- Let's enforce a single row constraint if possible, or just handle it in app.
  user_id uuid references auth.users not null,
  constraint settings_pkey primary key (id)
);

alter table public.settings enable row level security;
create policy "Owner view settings" on settings for select using (auth.uid() = user_id);
create policy "Owner update settings" on settings for update using (auth.uid() = user_id);
create policy "Owner insert settings" on settings for insert with check (auth.uid() = user_id);


-- ==========================================
-- 2. PRODUCTS TABLE UPDATES
-- ==========================================
-- Add 'type' column for Physical/Digital distinction
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'type') then
        alter table public.products add column type text check (type in ('physical', 'digital')) default 'physical';
    end if;
end $$;

-- ==========================================
-- 3. DAILY SALES TABLE (Aggregate Entry)
-- ==========================================
create table if not exists public.daily_sales (
  id uuid not null default gen_random_uuid (),
  date date not null default CURRENT_DATE,
  product_id uuid references public.products not null,
  quantity_sold integer not null default 0,
  quantity_returned integer not null default 0,
  ad_cost_dollar numeric not null default 0, -- Ad spend in DOLLARS for this specific product on this day
  
  -- Calculated fields can be handled in views or application logic. 
  -- Storing raw inputs is safer.
  
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint daily_sales_pkey primary key (id)
);

alter table public.daily_sales enable row level security;
create policy "Owner view daily_sales" on daily_sales for select using (auth.uid() = user_id);
create policy "Owner insert daily_sales" on daily_sales for insert with check (auth.uid() = user_id);
create policy "Owner update daily_sales" on daily_sales for update using (auth.uid() = user_id);
create policy "Owner delete daily_sales" on daily_sales for delete using (auth.uid() = user_id);

-- ==========================================
-- 4. TRANSACTIONS / ACCOUNTS UPDATES (Refinement)
-- ==========================================
-- Ensure 'payment_method' or similar exists if not already covered by 'accounts' table logic.
-- The existing 'transactions' table links to 'accounts', so that should suffice for Cash/Bkash/Bank tracking.
-- We verify 'accounts' table exists from previous setup.

-- Make sure we have a way to distinguish "Investment", "Withdrawal" etc. in transactions
-- The existing 'transaction_type' is (income, expense, transfer).
-- We might want a 'category' or 'subcategory' text field if not present.
-- Existing schema has 'category' text. Good.

