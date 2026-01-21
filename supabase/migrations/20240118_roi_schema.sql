-- Create categories table
create table public.roi_categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  unit_price numeric not null default 0,
  cogs_per_unit numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_categories_pkey primary key (id)
);

-- Create sales_records table
create table public.roi_sales_records (
  id uuid not null default gen_random_uuid (),
  date date not null,
  category_id uuid references public.roi_categories not null,
  units_sold integer not null default 0,
  returns integer not null default 0,
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_sales_records_pkey primary key (id)
);

-- Create expenses table
create table public.roi_expenses (
  id uuid not null default gen_random_uuid (),
  date date not null,
  description text not null,
  amount numeric not null,
  expense_type text check (expense_type in ('fixed', 'variable', 'ad_cost', 'salary', 'other')),
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_expenses_pkey primary key (id)
);

-- Enable RLS
alter table public.roi_categories enable row level security;
alter table public.roi_sales_records enable row level security;
alter table public.roi_expenses enable row level security;

-- Create policies
create policy "Users can view their own categories" on roi_categories
  for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on roi_categories
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on roi_categories
  for update using (auth.uid() = user_id);

create policy "Users can view their own sales" on roi_sales_records
  for select using (auth.uid() = user_id);
create policy "Users can insert their own sales" on roi_sales_records
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own sales" on roi_sales_records
  for update using (auth.uid() = user_id);

create policy "Users can view their own expenses" on roi_expenses
  for select using (auth.uid() = user_id);
create policy "Users can insert their own expenses" on roi_expenses
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own expenses" on roi_expenses
  for update using (auth.uid() = user_id);
