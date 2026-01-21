-- Create roi_expenses table
create table if not exists public.roi_expenses (
  id uuid not null default gen_random_uuid (),
  description text not null,
  amount numeric not null default 0,
  expense_type text not null, -- e.g., 'office_rent', 'salary', 'ad_cost'
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  user_id uuid references auth.users not null,
  constraint roi_expenses_pkey primary key (id)
);

-- Enable RLS
alter table public.roi_expenses enable row level security;

-- Create Policies
create policy "Owner view expenses" on roi_expenses for select using (auth.uid() = user_id);
create policy "Owner insert expenses" on roi_expenses for insert with check (auth.uid() = user_id);
create policy "Owner update expenses" on roi_expenses for update using (auth.uid() = user_id);
create policy "Owner delete expenses" on roi_expenses for delete using (auth.uid() = user_id);

-- Also ensure roi_categories exists if it was referenced (optional, but good practice)
create table if not exists public.roi_categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  type text,
  user_id uuid references auth.users not null,
  constraint roi_categories_pkey primary key (id)
);

alter table public.roi_categories enable row level security;
create policy "Owner all categories" on roi_categories for all using (auth.uid() = user_id);
