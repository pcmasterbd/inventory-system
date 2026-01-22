-- Create Funds Table
create table if not exists funds (
    id uuid default gen_random_uuid() primary key,
    name text not null, -- 'property_fund', 'others_fund'
    balance numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial funds if not exist
insert into funds (name, balance) values 
    ('property_fund', 0),
    ('others_fund', 0)
on conflict do nothing;

-- Create Daily Stats / Ledger Summary Table
create table if not exists daily_ledger (
    id uuid default gen_random_uuid() primary key,
    date date not null unique,
    dollar_cost numeric default 0, -- Cost in USD
    total_revenue numeric default 0,
    total_expense numeric default 0,
    net_profit numeric default 0,
    
    -- Fund allocations for the day
    property_fund_added numeric default 0,
    others_fund_added numeric default 0,
    
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure we have an 'accounts' table (checking if it exists or creating partial)
create table if not exists accounts (
    id uuid default gen_random_uuid() primary key,
    name text not null, -- 'cash', 'bank', 'bkash', 'courier_stedfast'
    balance numeric default 0
);

-- Seed Accounts
insert into accounts (name, balance) values 
    ('cash_drawer', 0),
    ('bank_account', 0),
    ('bkash_personal', 0),
    ('nagad_personal', 0),
    ('courrier_stedfast', 0)
on conflict do nothing;

-- Add RLS Policies (Simplified for single user admin)
alter table funds enable row level security;
alter table daily_ledger enable row level security;
alter table accounts enable row level security;

create policy "Enable all for authenticated" on funds for all using (true);
create policy "Enable all for authenticated" on daily_ledger for all using (true);
create policy "Enable all for authenticated" on accounts for all using (true);
