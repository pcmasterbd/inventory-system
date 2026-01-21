-- Create funds_transactions table
create table if not exists public.funds_transactions (
  id uuid not null default gen_random_uuid (),
  date date not null default current_date,
  amount numeric not null,
  transaction_type text check (transaction_type in ('deposit', 'withdrawal', 'adjustment', 'expense_payment', 'sales_deposit')),
  description text,
  payment_method text default 'cash',
  category text, -- for categorization of funds usage
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint funds_transactions_pkey primary key (id)
);

-- Enable RLS
alter table public.funds_transactions enable row level security;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'funds_transactions' 
        AND policyname = 'Users can view their own funds transactions'
    ) THEN
        create policy "Users can view their own funds transactions" on funds_transactions
          for select using (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'funds_transactions' 
        AND policyname = 'Users can insert their own funds transactions'
    ) THEN
        create policy "Users can insert their own funds transactions" on funds_transactions
          for insert with check (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'funds_transactions' 
        AND policyname = 'Users can update their own funds transactions'
    ) THEN
        create policy "Users can update their own funds transactions" on funds_transactions
          for update using (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'funds_transactions' 
        AND policyname = 'Users can delete their own funds transactions'
    ) THEN
        create policy "Users can delete their own funds transactions" on funds_transactions
          for delete using (auth.uid() = user_id);
    END IF;
END $$;

-- Create a view for Daily Snapshot calculation (combining sales, expenses, and funds)
drop view if exists public.daily_business_snapshot;
create or replace view public.daily_business_snapshot as
select 
    coalesce(s.date, e.date, f.date) as date,
    coalesce(s.total_sales, 0) as total_sales,
    coalesce(e.total_expenses, 0) as total_expenses,
    coalesce(f.net_funds_flow, 0) as net_funds_flow,
    (coalesce(s.total_sales, 0) - coalesce(e.total_expenses, 0)) as daily_profit_loss,
    s.user_id 
from 
    (select 
        date(invoices.date) as date,
        invoices.user_id,
        sum(invoice_items.quantity * invoice_items.unit_price) as total_sales,
        sum(invoice_items.quantity * products.cost_price) as total_cost
     from invoice_items
     join invoices on invoice_items.invoice_id = invoices.id
     join products on invoice_items.product_id = products.id
     where invoices.status != 'cancelled'
     group by date(invoices.date), invoices.user_id) s
full outer join
    (select date(date) as date, user_id, sum(amount) as total_expenses 
     from transactions 
     where transaction_type = 'expense'
     group by date(date), user_id) e
on s.date = e.date and s.user_id = e.user_id
full outer join
    (select date(date) as date, user_id, sum(case when transaction_type = 'deposit' then amount when transaction_type in ('withdrawal', 'expense_payment') then -amount else 0 end) as net_funds_flow 
     from funds_transactions 
     group by date(date), user_id) f
on coalesce(s.date, e.date) = f.date and coalesce(s.user_id, e.user_id) = f.user_id;
