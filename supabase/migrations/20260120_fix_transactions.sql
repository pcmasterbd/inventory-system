-- Link Accounts and Transactions (Fix for Dashboard Error)

-- 1. Create Accounts Table (if missing)
create table if not exists public.accounts (
  id uuid not null default gen_random_uuid (),
  name text not null,
  balance numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint accounts_pkey primary key (id)
);

alter table public.accounts enable row level security;
-- Dropping policies first to avoid "policy already exists" errors if re-running
drop policy if exists "Owner view accounts" on accounts;
drop policy if exists "Owner insert accounts" on accounts;
drop policy if exists "Owner update accounts" on accounts;

create policy "Owner view accounts" on accounts for select using (auth.uid() = user_id);
create policy "Owner insert accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Owner update accounts" on accounts for update using (auth.uid() = user_id);

-- 2. Create Transactions Table (if missing)
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
drop policy if exists "Owner view transactions" on transactions;
drop policy if exists "Owner insert transactions" on transactions;

create policy "Owner view transactions" on transactions for select using (auth.uid() = user_id);
create policy "Owner insert transactions" on transactions for insert with check (auth.uid() = user_id);

-- 3. Insert Default Accounts (Optional, helpful for new users)
-- Only insert if they don't exist
insert into public.accounts (name, user_id)
select 'Cash Drawer', auth.uid()
from auth.users
where id = auth.uid()
and not exists (select 1 from public.accounts where name = 'Cash Drawer' and user_id = auth.uid());

insert into public.accounts (name, user_id)
select 'Bank Account', auth.uid()
from auth.users
where id = auth.uid()
and not exists (select 1 from public.accounts where name = 'Bank Account' and user_id = auth.uid());

-- Refresh Schema Cache
NOTIFY pgrst, 'reload config';
