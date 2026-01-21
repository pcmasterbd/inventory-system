-- INVENTORY MODULE
create table if not exists public.products (
  id uuid not null default gen_random_uuid (),
  name text not null,
  sku text,
  description text,
  selling_price numeric not null default 0,
  cost_price numeric not null default 0,
  stock_quantity integer not null default 0,
  category_id uuid references public.roi_categories,
  image_url text,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint products_pkey primary key (id)
);

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

-- CRM MODULE (PARTIES)
create table if not exists public.parties (
  id uuid not null default gen_random_uuid (),
  name text not null,
  type text check (type in ('customer', 'supplier')),
  phone text,
  email text,
  address text,
  balance numeric not null default 0, -- Positive = Receivable, Negative = Payable
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint parties_pkey primary key (id)
);

-- SALES & INVOICES
create table if not exists public.invoices (
  id uuid not null default gen_random_uuid (),
  invoice_number text not null,
  customer_id uuid references public.parties, -- Can be null for walking customers
  total_amount numeric not null default 0,
  discount numeric not null default 0,
  paid_amount numeric not null default 0,
  due_amount numeric generated always as (total_amount - discount - paid_amount) stored,
  status text check (status in ('paid', 'partial', 'unpaid', 'cancelled')),
  date timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint invoices_pkey primary key (id)
);

create table if not exists public.invoice_items (
  id uuid not null default gen_random_uuid (),
  invoice_id uuid references public.invoices not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  unit_price numeric not null,
  subtotal numeric generated always as (quantity * unit_price) stored,
  user_id uuid references auth.users not null,
  constraint invoice_items_pkey primary key (id)
);

-- ACCOUNTS MODULE
create table if not exists public.accounts (
  id uuid not null default gen_random_uuid (),
  name text not null, -- e.g., 'Cash drawer', 'Bank Account'
  balance numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint accounts_pkey primary key (id)
);

create table if not exists public.transactions (
  id uuid not null default gen_random_uuid (),
  account_id uuid references public.accounts not null,
  amount numeric not null,
  transaction_type text check (transaction_type in ('income', 'expense', 'transfer')),
  category text,
  description text,
  reference_id uuid, -- Optional link to invoice or purchase
  date timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint transactions_pkey primary key (id)
);

-- POLICIES (Drop existing policies first to be safe, then recreate)

-- Products
alter table public.products enable row level security;
drop policy if exists "Owner view products" on products;
drop policy if exists "Owner insert products" on products;
drop policy if exists "Owner update products" on products;
drop policy if exists "Owner delete products" on products;

create policy "Owner view products" on products for select using (auth.uid() = user_id);
create policy "Owner insert products" on products for insert with check (auth.uid() = user_id);
create policy "Owner update products" on products for update using (auth.uid() = user_id);
create policy "Owner delete products" on products for delete using (auth.uid() = user_id);

-- Inventory Transactions
alter table public.inventory_transactions enable row level security;
drop policy if exists "Owner view inv_trans" on inventory_transactions;
drop policy if exists "Owner insert inv_trans" on inventory_transactions;

create policy "Owner view inv_trans" on inventory_transactions for select using (auth.uid() = user_id);
create policy "Owner insert inv_trans" on inventory_transactions for insert with check (auth.uid() = user_id);

-- Parties
alter table public.parties enable row level security;
drop policy if exists "Owner view parties" on parties;
drop policy if exists "Owner insert parties" on parties;
drop policy if exists "Owner update parties" on parties;
drop policy if exists "Owner delete parties" on parties;

create policy "Owner view parties" on parties for select using (auth.uid() = user_id);
create policy "Owner insert parties" on parties for insert with check (auth.uid() = user_id);
create policy "Owner update parties" on parties for update using (auth.uid() = user_id);
create policy "Owner delete parties" on parties for delete using (auth.uid() = user_id);

-- Invoices
alter table public.invoices enable row level security;
drop policy if exists "Owner view invoices" on invoices;
drop policy if exists "Owner insert invoices" on invoices;
drop policy if exists "Owner update invoices" on invoices;

create policy "Owner view invoices" on invoices for select using (auth.uid() = user_id);
create policy "Owner insert invoices" on invoices for insert with check (auth.uid() = user_id);
create policy "Owner update invoices" on invoices for update using (auth.uid() = user_id);

-- Invoice Items
alter table public.invoice_items enable row level security;
drop policy if exists "Owner view invoice_items" on invoice_items;
drop policy if exists "Owner insert invoice_items" on invoice_items;

create policy "Owner view invoice_items" on invoice_items for select using (auth.uid() = user_id);
create policy "Owner insert invoice_items" on invoice_items for insert with check (auth.uid() = user_id);

-- Accounts
alter table public.accounts enable row level security;
drop policy if exists "Owner view accounts" on accounts;
drop policy if exists "Owner insert accounts" on accounts;
drop policy if exists "Owner update accounts" on accounts;
drop policy if exists "Owner delete accounts" on accounts;

create policy "Owner view accounts" on accounts for select using (auth.uid() = user_id);
create policy "Owner insert accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Owner update accounts" on accounts for update using (auth.uid() = user_id);
create policy "Owner delete accounts" on accounts for delete using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;
drop policy if exists "Owner view transactions" on transactions;
drop policy if exists "Owner insert transactions" on transactions;
drop policy if exists "Owner delete transactions" on transactions;

create policy "Owner view transactions" on transactions for select using (auth.uid() = user_id);
create policy "Owner insert transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Owner delete transactions" on transactions for delete using (auth.uid() = user_id);
