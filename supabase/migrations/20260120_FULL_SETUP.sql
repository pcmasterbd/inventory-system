-- MASTER SETUP SCRIPT
-- Run this in Supabase SQL Editor to initialize the database.

-- ==========================================
-- 1. ROI CATEGORIES (Required for Products)
-- ==========================================
create table if not exists public.roi_categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  unit_price numeric not null default 0,
  cogs_per_unit numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_categories_pkey primary key (id)
);

alter table public.roi_categories enable row level security;

create policy "Users can view their own categories" on roi_categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on roi_categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on roi_categories for update using (auth.uid() = user_id);

-- ==========================================
-- 2. PRODUCTS & INVENTORY
-- ==========================================
create table if not exists public.products (
  id uuid not null default gen_random_uuid (),
  name text not null,
  sku text,
  description text,
  selling_price numeric not null default 0,
  cost_price numeric not null default 0,
  stock_quantity integer not null default 0,
  category_id uuid references public.roi_categories, -- Links to ROI Categories
  image_url text,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint products_pkey primary key (id)
);

alter table public.products enable row level security;
create policy "Owner view products" on products for select using (auth.uid() = user_id);
create policy "Owner insert products" on products for insert with check (auth.uid() = user_id);
create policy "Owner update products" on products for update using (auth.uid() = user_id);
create policy "Owner delete products" on products for delete using (auth.uid() = user_id);


create table if not exists public.inventory_transactions (
  id uuid not null default gen_random_uuid (),
  product_id uuid references public.products not null,
  quantity integer not null, -- Positive for IN, Negative for OUT
  transaction_type text check (transaction_type in ('purchase', 'sale', 'adjustment', 'return')),
  reason text,
  date timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint inventory_transactions_pkey primary key (id)
);

alter table public.inventory_transactions enable row level security;
create policy "Owner view inv_trans" on inventory_transactions for select using (auth.uid() = user_id);
create policy "Owner insert inv_trans" on inventory_transactions for insert with check (auth.uid() = user_id); -- Fixed typo in policy name consistency

-- ==========================================
-- 3. PARTIES (Customers & Suppliers)
-- ==========================================
create table if not exists public.parties (
  id uuid not null default gen_random_uuid (),
  name text not null,
  type text check (type in ('customer', 'supplier')),
  phone text,
  email text,
  address text,
  balance numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint parties_pkey primary key (id)
);

alter table public.parties enable row level security;
create policy "Owner view parties" on parties for select using (auth.uid() = user_id);
create policy "Owner insert parties" on parties for insert with check (auth.uid() = user_id);
create policy "Owner update parties" on parties for update using (auth.uid() = user_id);

-- ==========================================
-- 4. INVOICES & SALES
-- ==========================================
create table if not exists public.invoices (
  id uuid not null default gen_random_uuid (),
  invoice_number text not null,
  customer_id uuid references public.parties,
  total_amount numeric not null default 0,
  discount numeric not null default 0,
  paid_amount numeric not null default 0,
  -- Note: GENERATED ALWAYS AS ... STORED is good but sometimes causes issues with inserts if not handled. 
  -- Keeping it simple or as per core schema. Core schema had it.
  due_amount numeric generated always as (total_amount - discount - paid_amount) stored,
  status text check (status in ('paid', 'partial', 'unpaid', 'cancelled')),
  date timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  created_at timestamp with time zone not null default now(), -- Added for compatibility with my code
  constraint invoices_pkey primary key (id)
);

alter table public.invoices enable row level security;
create policy "Owner view invoices" on invoices for select using (auth.uid() = user_id);
create policy "Owner insert invoices" on invoices for insert with check (auth.uid() = user_id);
create policy "Owner update invoices" on invoices for update using (auth.uid() = user_id);
create policy "Owner delete invoices" on invoices for delete using (auth.uid() = user_id);

create table if not exists public.invoice_items (
  id uuid not null default gen_random_uuid (),
  invoice_id uuid references public.invoices(id) on delete cascade not null, -- Added cascade
  product_id uuid references public.products not null,
  quantity integer not null,
  unit_price numeric not null,
  subtotal numeric generated always as (quantity * unit_price) stored,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone not null default now(), -- Added for compatibility
  constraint invoice_items_pkey primary key (id)
);

alter table public.invoice_items enable row level security;
create policy "Owner view invoice_items" on invoice_items for select using (auth.uid() = user_id);
create policy "Owner insert invoice_items" on invoice_items for insert with check (auth.uid() = user_id);
create policy "Owner delete invoice_items" on invoice_items for delete using (auth.uid() = user_id);

-- ==========================================
-- 5. EXPENSES & ROI RECORDS
-- ==========================================
create table if not exists public.roi_expenses (
  id uuid not null default gen_random_uuid (),
  description text not null,
  amount numeric not null default 0,
  expense_type text not null,
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_expenses_pkey primary key (id)
);

alter table public.roi_expenses enable row level security;
create policy "Owner view expenses" on roi_expenses for select using (auth.uid() = user_id);
create policy "Owner insert expenses" on roi_expenses for insert with check (auth.uid() = user_id);
create policy "Owner update expenses" on roi_expenses for update using (auth.uid() = user_id);
create policy "Owner delete expenses" on roi_expenses for delete using (auth.uid() = user_id);

create table if not exists public.roi_sales_records (
  id uuid not null default gen_random_uuid (),
  date date not null,
  category_id uuid references public.roi_categories not null,
  units_sold integer not null default 0,
  returns integer not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_sales_records_pkey primary key (id)
);

alter table public.roi_sales_records enable row level security;
create policy "Users can view their own sales" on roi_sales_records for select using (auth.uid() = user_id);
create policy "Users can insert their own sales" on roi_sales_records for insert with check (auth.uid() = user_id);
create policy "Users can update their own sales" on roi_sales_records for update using (auth.uid() = user_id);

-- ==========================================
-- 6. INVESTMENTS
-- ==========================================
create table if not exists investments (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date not null,
    capital_amount numeric not null,
    current_return numeric default 0,
    status text default 'active' check (status in ('active', 'closed')),
    user_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table investments enable row level security;
create policy "Users can view their own investments" on investments for select using (auth.uid() = user_id);
create policy "Users can insert their own investments" on investments for insert with check (auth.uid() = user_id);
create policy "Users can update their own investments" on investments for update using (auth.uid() = user_id);
create policy "Users can delete their own investments" on investments for delete using (auth.uid() = user_id);

-- ==========================================
-- 7. ACCOUNTS & TRANSACTIONS (Optional but good to have)
-- ==========================================
create table if not exists public.accounts (
  id uuid not null default gen_random_uuid (),
  name text not null,
  balance numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint accounts_pkey primary key (id)
);

alter table public.accounts enable row level security;
create policy "Owner view accounts" on accounts for select using (auth.uid() = user_id);
create policy "Owner insert accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Owner update accounts" on accounts for update using (auth.uid() = user_id);

create table if not exists public.transactions (
  id uuid not null default gen_random_uuid (),
  account_id uuid references public.accounts not null,
  amount numeric not null,
  transaction_type text check (transaction_type in ('income', 'expense', 'transfer')),
  category text,
  description text,
  reference_id uuid,
  date timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint transactions_pkey primary key (id)
);

alter table public.transactions enable row level security;
create policy "Owner view transactions" on transactions for select using (auth.uid() = user_id);
create policy "Owner insert transactions" on transactions for insert with check (auth.uid() = user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
